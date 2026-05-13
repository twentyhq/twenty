import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Distinct ID prefix (cccc / dddd) so this suite doesn't collide with
// order-by-relation-field.integration-spec.ts when both run against the
// shared workspace database.
const TEST_COMPANY_IDS = {
  AIRBNB: '20202020-cccc-4000-8000-000000000001',
  STRIPE: '20202020-cccc-4000-8000-000000000002',
  NOTION: '20202020-cccc-4000-8000-000000000003',
};

const TEST_PERSON_IDS = {
  AIRBNB_ENGINEER: '20202020-dddd-4000-8000-000000000001',
  AIRBNB_DESIGNER: '20202020-dddd-4000-8000-000000000002',
  STRIPE_ENGINEER: '20202020-dddd-4000-8000-000000000003',
  NOTION_ENGINEER: '20202020-dddd-4000-8000-000000000004',
  UNAFFILIATED: '20202020-dddd-4000-8000-000000000005',
};

const ALL_TEST_PERSON_IDS = Object.values(TEST_PERSON_IDS);

describe('Filter by relation field (e2e)', () => {
  beforeAll(async () => {
    const createCompanies = createManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id name',
      data: [
        { id: TEST_COMPANY_IDS.AIRBNB, name: 'Airbnb' },
        { id: TEST_COMPANY_IDS.STRIPE, name: 'Stripe' },
        { id: TEST_COMPANY_IDS.NOTION, name: 'Notion' },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createCompanies);

    const createPeople = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: 'id',
      data: [
        {
          id: TEST_PERSON_IDS.AIRBNB_ENGINEER,
          companyId: TEST_COMPANY_IDS.AIRBNB,
          jobTitle: 'Engineer',
        },
        {
          id: TEST_PERSON_IDS.AIRBNB_DESIGNER,
          companyId: TEST_COMPANY_IDS.AIRBNB,
          jobTitle: 'Designer',
        },
        {
          id: TEST_PERSON_IDS.STRIPE_ENGINEER,
          companyId: TEST_COMPANY_IDS.STRIPE,
          jobTitle: 'Engineer',
        },
        {
          id: TEST_PERSON_IDS.NOTION_ENGINEER,
          companyId: TEST_COMPANY_IDS.NOTION,
          jobTitle: 'Engineer',
        },
        {
          id: TEST_PERSON_IDS.UNAFFILIATED,
          companyId: null,
          jobTitle: 'Engineer',
        },
      ],
      upsert: true,
    });

    await makeGraphqlAPIRequest(createPeople);
  });

  it('should filter people by company name (exact match)', async () => {
    const queryData = {
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
        filter: {
          and: [
            { id: { in: ALL_TEST_PERSON_IDS } },
            { company: { name: { eq: 'Airbnb' } } },
          ],
        },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const ids = response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(ids.sort()).toEqual(
      [TEST_PERSON_IDS.AIRBNB_ENGINEER, TEST_PERSON_IDS.AIRBNB_DESIGNER].sort(),
    );
  });

  it('should filter people by company name with like operator', async () => {
    const queryData = {
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
        filter: {
          and: [
            { id: { in: ALL_TEST_PERSON_IDS } },
            { company: { name: { like: '%irbnb%' } } },
          ],
        },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();

    const ids = response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(ids.sort()).toEqual(
      [TEST_PERSON_IDS.AIRBNB_ENGINEER, TEST_PERSON_IDS.AIRBNB_DESIGNER].sort(),
    );
  });

  it('should return no results when the relation filter does not match any record', async () => {
    const queryData = {
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
        filter: {
          and: [
            { id: { in: ALL_TEST_PERSON_IDS } },
            { company: { name: { eq: 'NonExistentCorp' } } },
          ],
        },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.people.edges).toEqual([]);
  });

  it('should combine a relation filter with a scalar filter on the root object', async () => {
    const queryData = {
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
        filter: {
          and: [
            { id: { in: ALL_TEST_PERSON_IDS } },
            { company: { name: { eq: 'Airbnb' } } },
            { jobTitle: { eq: 'Designer' } },
          ],
        },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();

    const ids = response.body.data.people.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(ids).toEqual([TEST_PERSON_IDS.AIRBNB_DESIGNER]);
  });

  it('should combine a relation filter with an order-by on the same relation (join dedupe)', async () => {
    // Both the filter and the orderBy traverse `person.company`. Without the
    // shared join registry both paths would call leftJoin('person.company',
    // 'company') and TypeORM would throw "Duplicate alias 'company'".
    const queryData = {
      query: gql`
        query People(
          $filter: PersonFilterInput
          $orderBy: [PersonOrderByInput]
        ) {
          people(filter: $filter, orderBy: $orderBy, first: 10) {
            edges {
              node {
                id
                company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: {
        filter: {
          and: [
            { id: { in: ALL_TEST_PERSON_IDS } },
            { company: { name: { like: '%i%' } } },
          ],
        },
        orderBy: [{ company: { name: 'AscNullsLast' } }],
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeUndefined();

    const companyNames = response.body.data.people.edges.map(
      (edge: { node: { company: { name: string } | null } }) =>
        edge.node.company?.name ?? null,
    );

    // Airbnb, Notion, Stripe all contain "i"; ascending order
    expect(companyNames).toEqual(['Airbnb', 'Airbnb', 'Notion', 'Stripe']);
  });

  it('should reject relation filters nested deeper than one hop', async () => {
    const queryData = {
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
        filter: {
          // person → company → accountOwner is a depth-2 traversal (two
          // MANY_TO_ONE hops); the arg processor caps depth at 1 and should
          // reject this before the SQL builder ever sees it.
          company: {
            accountOwner: {
              name: { firstName: { eq: 'Anything' } },
            },
          },
        },
      },
    };

    const response = await makeGraphqlAPIRequest(queryData);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
