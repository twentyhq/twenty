import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const TEST_COMPANY_IDS = {
  RECENTLY_CONTACTED: '20202020-cccc-4000-8000-200000000001',
  NOT_CONTACTED_SINCE: '20202020-cccc-4000-8000-200000000002',
};

const TEST_PERSON_IDS = {
  JOINED_AFTER_COMPANY: '20202020-dddd-4000-8000-200000000001',
  JOINED_BEFORE_COMPANY: '20202020-dddd-4000-8000-200000000002',
};

const TEST_OPPORTUNITY_IDS = {
  CLOSING_BEFORE_COMPANY: '20202020-eeee-4000-8000-200000000001',
  CLOSING_AFTER_COMPANY: '20202020-eeee-4000-8000-200000000002',
  WITHOUT_CLOSE_DATE: '20202020-eeee-4000-8000-200000000003',
};

const ALL_TEST_COMPANY_IDS = Object.values(TEST_COMPANY_IDS);
const ALL_TEST_PERSON_IDS = Object.values(TEST_PERSON_IDS);
const ALL_TEST_OPPORTUNITY_IDS = Object.values(TEST_OPPORTUNITY_IDS);

const findIds = async ({
  objectNamePlural,
  filterInputType,
  testIds,
  filter,
}: {
  objectNamePlural: string;
  filterInputType: string;
  testIds: string[];
  filter: Record<string, unknown>;
}) => {
  const response = await makeGraphqlApiRequest({
    query: gql`
      query FindIds($filter: ${filterInputType}) {
        ${objectNamePlural}(filter: $filter, first: 10) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    variables: { filter: { and: [{ id: { in: testIds } }, filter] } },
  });

  return {
    errorMessage: response.body.errors?.[0]?.message as string | undefined,
    ids: (response.body.data?.[objectNamePlural]?.edges ?? [])
      .map((edge: { node: { id: string } }) => edge.node.id)
      .sort(),
  };
};

const findCompanyIds = (filter: Record<string, unknown>) =>
  findIds({
    objectNamePlural: 'companies',
    filterInputType: 'CompanyFilterInput',
    testIds: ALL_TEST_COMPANY_IDS,
    filter,
  });

const findPersonIds = (filter: Record<string, unknown>) =>
  findIds({
    objectNamePlural: 'people',
    filterInputType: 'PersonFilterInput',
    testIds: ALL_TEST_PERSON_IDS,
    filter,
  });

const findOpportunityIds = (filter: Record<string, unknown>) =>
  findIds({
    objectNamePlural: 'opportunities',
    filterInputType: 'OpportunityFilterInput',
    testIds: ALL_TEST_OPPORTUNITY_IDS,
    filter,
  });

describe('Filter by field reference (e2e)', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          {
            id: TEST_COMPANY_IDS.RECENTLY_CONTACTED,
            name: 'FieldReferenceRecent',
            createdAt: '2026-01-01T00:00:00.000Z',
            employees: 10,
            position: 10,
          },
          {
            id: TEST_COMPANY_IDS.NOT_CONTACTED_SINCE,
            name: 'FieldReferenceStale',
            createdAt: '2026-06-01T00:00:00.000Z',
            employees: 20,
            position: 5,
          },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          {
            id: TEST_PERSON_IDS.JOINED_AFTER_COMPANY,
            companyId: TEST_COMPANY_IDS.RECENTLY_CONTACTED,
            createdAt: '2026-03-01T00:00:00.000Z',
          },
          {
            id: TEST_PERSON_IDS.JOINED_BEFORE_COMPANY,
            companyId: TEST_COMPANY_IDS.NOT_CONTACTED_SINCE,
            createdAt: '2026-03-01T00:00:00.000Z',
          },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          {
            id: TEST_OPPORTUNITY_IDS.CLOSING_BEFORE_COMPANY,
            name: 'FieldReferenceClosingBefore',
            companyId: TEST_COMPANY_IDS.NOT_CONTACTED_SINCE,
            closeDate: '2026-05-01T00:00:00.000Z',
          },
          {
            id: TEST_OPPORTUNITY_IDS.CLOSING_AFTER_COMPANY,
            name: 'FieldReferenceClosingAfter',
            companyId: TEST_COMPANY_IDS.RECENTLY_CONTACTED,
            closeDate: '2026-02-01T00:00:00.000Z',
          },
          {
            id: TEST_OPPORTUNITY_IDS.WITHOUT_CLOSE_DATE,
            name: 'FieldReferenceWithoutCloseDate',
            companyId: TEST_COMPANY_IDS.RECENTLY_CONTACTED,
            closeDate: null,
          },
        ],
        upsert: true,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_OPPORTUNITY_IDS } },
      }),
    );

    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_PERSON_IDS } },
      }),
    );

    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_COMPANY_IDS } },
      }),
    );
  });

  describe('on the same record', () => {
    it('compares two date fields', async () => {
      const { errorMessage, ids } = await findCompanyIds({
        updatedAt: { gtField: 'createdAt' },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([...ALL_TEST_COMPANY_IDS].sort());
    });

    it.each([
      ['gtField', [TEST_COMPANY_IDS.NOT_CONTACTED_SINCE]],
      ['gteField', ALL_TEST_COMPANY_IDS],
      ['ltField', []],
      ['lteField', [TEST_COMPANY_IDS.RECENTLY_CONTACTED]],
    ])(
      'applies %s to two number fields, equal values included only by the inclusive operators',
      async (operator, expectedIds) => {
        const { errorMessage, ids } = await findCompanyIds({
          employees: { [operator]: 'position' },
        });

        expect(errorMessage).toBeUndefined();
        expect(ids).toEqual([...expectedIds].sort());
      },
    );

    it('excludes every record under a negated comparison that matches them all', async () => {
      const { errorMessage, ids } = await findCompanyIds({
        not: { updatedAt: { gtField: 'createdAt' } },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([]);
    });
  });

  describe('through a relation, back to the record the filter starts from', () => {
    it('compares through a to-many relation', async () => {
      const { errorMessage, ids } = await findCompanyIds({
        people: { createdAt: { gtField: 'company.createdAt' } },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([TEST_COMPANY_IDS.RECENTLY_CONTACTED]);
    });

    it('compares through a many-to-one relation', async () => {
      const { errorMessage, ids } = await findPersonIds({
        company: { createdAt: { gtField: 'people.createdAt' } },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([TEST_PERSON_IDS.JOINED_BEFORE_COMPANY]);
    });

    it('never matches a NULL field, as in SQL', async () => {
      const { errorMessage, ids } = await findOpportunityIds({
        company: { createdAt: { gtField: 'opportunities.closeDate' } },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([TEST_OPPORTUNITY_IDS.CLOSING_BEFORE_COMPANY]);
    });

    it('combines with an "is NULL" branch, as the inbox tabs do', async () => {
      const { errorMessage, ids } = await findCompanyIds({
        opportunities: {
          or: [
            { closeDate: { is: 'NULL' } },
            { closeDate: { ltField: 'company.createdAt' } },
          ],
        },
      });

      expect(errorMessage).toBeUndefined();
      expect(ids).toEqual([...ALL_TEST_COMPANY_IDS].sort());
    });
  });

  describe('rejections', () => {
    it.each([
      [
        'a relation reference outside a relation filter',
        () => findPersonIds({ createdAt: { gtField: 'company.createdAt' } }),
        'must go through the relation back',
      ],
      [
        'a relation that does not lead back to the record the filter starts from',
        () =>
          findCompanyIds({
            opportunities: {
              closeDate: { ltField: 'pointOfContact.createdAt' },
            },
          }),
        'must go through the relation back',
      ],
      [
        'a path through more than one relation',
        () =>
          findCompanyIds({
            people: {
              createdAt: { gtField: 'company.accountOwner.createdAt' },
            },
          }),
        'expects "field" or "relation.field"',
      ],
      [
        'a field that does not exist',
        () => findCompanyIds({ createdAt: { gtField: 'unknownField' } }),
        'doesn\'t have any "unknownField" field',
      ],
      [
        'fields of different types',
        () => findCompanyIds({ createdAt: { gtField: 'employees' } }),
        'Cannot compare field',
      ],
      [
        'a composite sub-field',
        () =>
          findCompanyIds({
            annualRevenue: { amountMicros: { gtField: 'employees' } },
          }),
        'cannot be compared with another field',
      ],
    ])('rejects %s', async (_, runQuery, expectedMessage) => {
      const { errorMessage } = await runQuery();

      expect(errorMessage).toContain(expectedMessage);
    });
  });
});
