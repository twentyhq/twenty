import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import {
  type RlsCompanyRelationRecords,
  cleanupRlsCompanyRelationRecords,
  setupRlsCompanyRelationRecords,
} from 'test/integration/graphql/utils/setup-rls-company-relation-records.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const SEEDED_PEOPLE_COUNT = 3;
const PEOPLE_LINKED_TO_VISIBLE_COMPANY_COUNT = 1;
const PEOPLE_LINKED_TO_HIDDEN_COMPANY_OR_NO_COMPANY_COUNT = 2;

const RECORDS_CREATED_AT = '2019-06-15T10:00:00.000Z';
const RECORDS_WINDOW_FILTER = {
  and: [
    { createdAt: { gte: '2019-06-15T00:00:00.000Z' } },
    { createdAt: { lte: '2019-06-15T23:59:59.999Z' } },
  ],
};

describe('group-by on a relation respects row-level permission predicates', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  let records: RlsCompanyRelationRecords;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'RLS GroupBy Relation Test Role',
      description: 'Role for testing RLS on relation group-by',
    });

    records = await setupRlsCompanyRelationRecords({
      companyNamePrefix: 'RLS GroupBy Relation',
      createdAt: RECORDS_CREATED_AT,
    });
  });

  afterAll(async () => {
    await cleanupRlsCompanyRelationRecords(records);
    await cleanupCompanyNameRlsRole(rlsRole);
  });

  it('does not expose hidden related dimension values and folds hidden-linked records into the null group', async () => {
    const response = await makeGraphqlAPIRequest(
      groupByOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        groupBy: [{ company: { name: true } }],
        filter: RECORDS_WINDOW_FILTER,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const groups = response.body.data.peopleGroupBy;

    jestExpectToBeDefined(groups);

    const dimensionValues = groups.flatMap(
      (group: { groupByDimensionValues: unknown[] }) =>
        group.groupByDimensionValues,
    );

    expect(dimensionValues).toContain(records.visibleCompanyName);
    expect(dimensionValues).not.toContain(records.hiddenCompanyName);

    const peopleCountAcrossAllGroups = groups.reduce(
      (sum: number, group: { totalCount: number }) => sum + group.totalCount,
      0,
    );

    expect(peopleCountAcrossAllGroups).toBe(SEEDED_PEOPLE_COUNT);

    const visibleCompanyGroup = groups.find(
      (group: { groupByDimensionValues: unknown[] }) =>
        group.groupByDimensionValues.includes(records.visibleCompanyName),
    );

    expect(visibleCompanyGroup?.totalCount).toBe(
      PEOPLE_LINKED_TO_VISIBLE_COMPANY_COUNT,
    );

    const groupWithoutVisibleCompanyName = groups.find(
      (group: { groupByDimensionValues: unknown[] }) =>
        !group.groupByDimensionValues.includes(records.visibleCompanyName),
    );

    expect(groupWithoutVisibleCompanyName?.totalCount).toBe(
      PEOPLE_LINKED_TO_HIDDEN_COMPANY_OR_NO_COMPANY_COUNT,
    );
  });

  it('sorts records linked to a hidden related record as null when ordering records within groups by that relation', async () => {
    const response = await makeGraphqlAPIRequest(
      groupByOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        groupBy: [{ jobTitle: true }],
        filter: RECORDS_WINDOW_FILTER,
        orderByForRecords: [{ company: { name: 'AscNullsLast' } }],
        offsetForRecords: 1,
        gqlFields: 'edges { node { id } }',
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const groups = response.body.data.peopleGroupBy;

    jestExpectToBeDefined(groups);
    expect(groups).toHaveLength(1);

    const recordIdsAfterSkippingFirstRankedRecord = groups[0].edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(recordIdsAfterSkippingFirstRankedRecord).not.toContain(
      records.personWithVisibleCompanyId,
    );
    expect(recordIdsAfterSkippingFirstRankedRecord).toEqual(
      expect.arrayContaining([
        records.personWithHiddenCompanyId,
        records.personWithoutCompanyId,
      ]),
    );
    expect(recordIdsAfterSkippingFirstRankedRecord).toHaveLength(2);
  });
});
