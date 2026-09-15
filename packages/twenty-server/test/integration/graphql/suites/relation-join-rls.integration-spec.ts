import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
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

const RECORDS_CREATED_AT = '2019-07-15T10:00:00.000Z';
const RECORDS_WINDOW_FILTER = {
  and: [
    { createdAt: { gte: '2019-07-15T00:00:00.000Z' } },
    { createdAt: { lte: '2019-07-15T23:59:59.999Z' } },
  ],
};

describe('relation-filter and order-by respect row-level permission predicates', () => {
  let rlsRole: CompanyNameRlsRoleSetup;
  let records: RlsCompanyRelationRecords;

  beforeAll(async () => {
    rlsRole = await setupCompanyNameRlsRole({
      label: 'RLS Relation Join Test Role',
      description: 'Role for testing RLS on relation-filter and order-by',
    });

    records = await setupRlsCompanyRelationRecords({
      companyNamePrefix: 'RLS Relation Join',
      createdAt: RECORDS_CREATED_AT,
    });
  });

  afterAll(async () => {
    await cleanupRlsCompanyRelationRecords(records);
    await cleanupCompanyNameRlsRole(rlsRole);
  });

  it('does not match a relation filter targeting a hidden related record', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { company: { name: { eq: records.hiddenCompanyName } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.people.edges).toHaveLength(0);
  });

  it('matches a relation filter targeting a visible related record', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { company: { name: { eq: records.visibleCompanyName } } },
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const ids = response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(ids).toEqual([records.personWithVisibleCompanyId]);
  });

  it('sorts records linked to a hidden related record as null when ordering by that relation', async () => {
    const response = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: RECORDS_WINDOW_FILTER,
        orderBy: [{ company: { name: 'AscNullsLast' } }],
        first: 10,
      }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const [personIdWithNonNullSortKey, ...personIdsSortedAsNull] =
      response.body.data.people.edges.map(
        (edge: { node: { id: string } }) => edge.node.id,
      );

    expect(personIdWithNonNullSortKey).toBe(records.personWithVisibleCompanyId);
    expect(personIdsSortedAsNull).toEqual(
      expect.arrayContaining([
        records.personWithHiddenCompanyId,
        records.personWithoutCompanyId,
      ]),
    );
    expect(personIdsSortedAsNull).toHaveLength(2);
  });
});
