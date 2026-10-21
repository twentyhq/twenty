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

const ALL_TEST_COMPANY_IDS = Object.values(TEST_COMPANY_IDS);
const ALL_TEST_PERSON_IDS = Object.values(TEST_PERSON_IDS);

const findCompanyIds = async (filter: Record<string, unknown>) =>
  makeGraphqlApiRequest({
    query: gql`
      query Companies($filter: CompanyFilterInput) {
        companies(filter: $filter, first: 10) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    variables: {
      filter: { and: [{ id: { in: ALL_TEST_COMPANY_IDS } }, filter] },
    },
  });

const findPersonIds = async (filter: Record<string, unknown>) =>
  makeGraphqlApiRequest({
    query: gql`
      query People($filter: PersonFilterInput) {
        people(filter: $filter, first: 10) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    variables: {
      filter: { and: [{ id: { in: ALL_TEST_PERSON_IDS } }, filter] },
    },
  });

const getIds = (
  response: Awaited<ReturnType<typeof makeGraphqlApiRequest>>,
  objectNamePlural: string,
) =>
  response.body.data[objectNamePlural].edges
    .map((edge: { node: { id: string } }) => edge.node.id)
    .sort();

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
          },
          {
            id: TEST_COMPANY_IDS.NOT_CONTACTED_SINCE,
            name: 'FieldReferenceStale',
            createdAt: '2026-06-01T00:00:00.000Z',
            employees: 20,
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
  });

  afterAll(async () => {
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

  it('compares two fields of the same record', async () => {
    const response = await findCompanyIds({
      updatedAt: { gtField: 'createdAt' },
    });

    expect(response.body.errors).toBeUndefined();
    expect(getIds(response, 'companies')).toEqual(ALL_TEST_COMPANY_IDS.sort());
  });

  it('compares a related record through a to-many relation with the record the filter starts from', async () => {
    const response = await findCompanyIds({
      people: { createdAt: { gtField: 'company.createdAt' } },
    });

    expect(response.body.errors).toBeUndefined();
    expect(getIds(response, 'companies')).toEqual([
      TEST_COMPANY_IDS.RECENTLY_CONTACTED,
    ]);
  });

  it('compares a related record through a many-to-one relation with the record the filter starts from', async () => {
    const response = await findPersonIds({
      company: { createdAt: { gtField: 'people.createdAt' } },
    });

    expect(response.body.errors).toBeUndefined();
    expect(getIds(response, 'people')).toEqual([
      TEST_PERSON_IDS.JOINED_BEFORE_COMPANY,
    ]);
  });

  it('rejects a relation reference outside a relation filter', async () => {
    const response = await findPersonIds({
      createdAt: { gtField: 'company.createdAt' },
    });

    expect(response.body.errors?.[0]?.message).toContain(
      'must go through the relation back',
    );
  });

  it('rejects comparing fields of different types', async () => {
    const response = await findCompanyIds({
      createdAt: { gtField: 'employees' },
    });

    expect(response.body.errors?.[0]?.message).toContain(
      'Cannot compare field',
    );
  });
});
