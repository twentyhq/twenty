import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

const TEST_COMPANY_IDS = {
  ACME: '20202020-0e0e-4000-8000-000000000001',
  GLOBEX: '20202020-0e0e-4000-8000-000000000002',
};

const TEST_PERSON_IDS = {
  ACME_ENGINEER: '20202020-0e0e-4000-8000-100000000001',
  GLOBEX_DESIGNER: '20202020-0e0e-4000-8000-100000000002',
  ACME_NO_JOB_TITLE: '20202020-0e0e-4000-8000-100000000003',
  NO_COMPANY: '20202020-0e0e-4000-8000-100000000004',
};

const ALL_TEST_PERSON_IDS = Object.values(TEST_PERSON_IDS);

const findTestPersonIds = async (
  filter: Record<string, unknown>,
): Promise<string[]> => {
  const response = await makeGraphqlApiRequest({
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

  expect(response.body.errors).toBeUndefined();

  return response.body.data.people.edges
    .map((edge: { node: { id: string } }) => edge.node.id)
    .sort();
};

describe('neq filter on NULL values (e2e)', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: TEST_COMPANY_IDS.ACME, name: 'NeqAcme' },
          { id: TEST_COMPANY_IDS.GLOBEX, name: 'NeqGlobex' },
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
            id: TEST_PERSON_IDS.ACME_ENGINEER,
            companyId: TEST_COMPANY_IDS.ACME,
            jobTitle: 'Engineer',
          },
          {
            id: TEST_PERSON_IDS.GLOBEX_DESIGNER,
            companyId: TEST_COMPANY_IDS.GLOBEX,
            jobTitle: 'Designer',
          },
          {
            id: TEST_PERSON_IDS.ACME_NO_JOB_TITLE,
            companyId: TEST_COMPANY_IDS.ACME,
            jobTitle: null,
          },
          {
            id: TEST_PERSON_IDS.NO_COMPANY,
            companyId: null,
            jobTitle: 'Engineer',
          },
        ],
        upsert: true,
      }),
    );
  });

  it('should keep records without a value when comparing a text field to a real value', async () => {
    expect(await findTestPersonIds({ jobTitle: { neq: 'Engineer' } })).toEqual(
      [
        TEST_PERSON_IDS.GLOBEX_DESIGNER,
        TEST_PERSON_IDS.ACME_NO_JOB_TITLE,
      ].sort(),
    );
  });

  it('should exclude records without a value when comparing a text field to an empty value', async () => {
    expect(await findTestPersonIds({ jobTitle: { neq: '' } })).toEqual(
      [
        TEST_PERSON_IDS.ACME_ENGINEER,
        TEST_PERSON_IDS.GLOBEX_DESIGNER,
        TEST_PERSON_IDS.NO_COMPANY,
      ].sort(),
    );
  });

  it('should keep records without a relation when comparing its foreign key', async () => {
    expect(
      await findTestPersonIds({ companyId: { neq: TEST_COMPANY_IDS.ACME } }),
    ).toEqual(
      [TEST_PERSON_IDS.GLOBEX_DESIGNER, TEST_PERSON_IDS.NO_COMPANY].sort(),
    );
  });

  it('should keep records without a relation when comparing a related field', async () => {
    expect(
      await findTestPersonIds({ company: { name: { neq: 'NeqAcme' } } }),
    ).toEqual(
      [TEST_PERSON_IDS.GLOBEX_DESIGNER, TEST_PERSON_IDS.NO_COMPANY].sort(),
    );
  });

  it('should keep a neq filter scoped when combined with a sibling filter', async () => {
    expect(
      await findTestPersonIds({
        companyId: { eq: TEST_COMPANY_IDS.ACME },
        jobTitle: { neq: 'Engineer' },
      }),
    ).toEqual([TEST_PERSON_IDS.ACME_NO_JOB_TITLE]);
  });
});
