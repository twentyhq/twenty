import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const FIRST_COMPANY_ID = '20202020-fffe-4000-8000-000000000001';
const SECOND_COMPANY_ID = '20202020-fffe-4000-8000-000000000002';
const COMPANY_IDS = [FIRST_COMPANY_ID, SECOND_COMPANY_ID];

const buildPersonId = (index: number) =>
  `20202020-eeed-4000-8000-${index.toString().padStart(12, '0')}`;

const PEOPLE = [
  { id: buildPersonId(1), companyId: FIRST_COMPANY_ID, jobTitle: 'CEO' },
  { id: buildPersonId(2), companyId: FIRST_COMPANY_ID, jobTitle: 'Analyst' },
  { id: buildPersonId(3), companyId: FIRST_COMPANY_ID, jobTitle: 'Buyer' },
  { id: buildPersonId(4), companyId: SECOND_COMPANY_ID, jobTitle: 'CTO' },
  { id: buildPersonId(5), companyId: SECOND_COMPANY_ID, jobTitle: 'Designer' },
];

type CompanyWithPeopleEdge = {
  node: {
    id: string;
    people: { edges: { node: { id: string; jobTitle: string } }[] };
  };
};

const findCompaniesWithPeople = async (peopleSelection: string) => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: `
        id
        ${peopleSelection} {
          edges {
            node {
              id
              jobTitle
            }
          }
        }
      `,
      filter: { id: { in: COMPANY_IDS } },
    }),
  );

  return response;
};

const getJobTitlesByCompanyId = (edges: CompanyWithPeopleEdge[]) =>
  Object.fromEntries(
    edges.map(({ node }) => [
      node.id,
      node.people.edges.map(({ node: person }) => person.jobTitle),
    ]),
  );

describe('Nested one-to-many relation query arguments (e2e)', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: FIRST_COMPANY_ID, name: 'Nested arguments company one' },
          { id: SECOND_COMPANY_ID, name: 'Nested arguments company two' },
        ],
        upsert: false,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: PEOPLE,
        upsert: false,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: PEOPLE.map(({ id }) => id) } },
      }),
    );

    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: COMPANY_IDS } },
      }),
    );

    await waitForAllJobsToFinish();
  });

  it('filters related records per parent', async () => {
    const response = await findCompaniesWithPeople(
      'people(filter: { jobTitle: { in: ["CEO", "CTO"] } })',
    );

    expect(response.body.errors).toBeUndefined();
    expect(getJobTitlesByCompanyId(response.body.data.companies.edges)).toEqual(
      {
        [FIRST_COMPANY_ID]: ['CEO'],
        [SECOND_COMPANY_ID]: ['CTO'],
      },
    );
  });

  it('orders related records and limits them per parent', async () => {
    const orderedResponse = await findCompaniesWithPeople(
      'people(orderBy: [{ jobTitle: DescNullsLast }])',
    );

    expect(orderedResponse.body.errors).toBeUndefined();
    expect(
      getJobTitlesByCompanyId(orderedResponse.body.data.companies.edges),
    ).toEqual({
      [FIRST_COMPANY_ID]: ['CEO', 'Buyer', 'Analyst'],
      [SECOND_COMPANY_ID]: ['Designer', 'CTO'],
    });

    const limitedResponse = await findCompaniesWithPeople(
      'people(orderBy: [{ jobTitle: AscNullsLast }], first: 1)',
    );

    expect(limitedResponse.body.errors).toBeUndefined();
    expect(
      getJobTitlesByCompanyId(limitedResponse.body.data.companies.edges),
    ).toEqual({
      [FIRST_COMPANY_ID]: ['Analyst'],
      [SECOND_COMPANY_ID]: ['CTO'],
    });
  });

  it('reads nested arguments from variables', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query CompaniesWithFilteredPeople(
          $filter: CompanyFilterInput
          $peopleFilter: PersonFilterInput
        ) {
          companies(filter: $filter) {
            edges {
              node {
                id
                people(filter: $peopleFilter) {
                  edges {
                    node {
                      id
                      jobTitle
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        filter: { id: { in: COMPANY_IDS } },
        peopleFilter: { jobTitle: { eq: 'Designer' } },
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(getJobTitlesByCompanyId(response.body.data.companies.edges)).toEqual(
      {
        [FIRST_COMPANY_ID]: [],
        [SECOND_COMPANY_ID]: ['Designer'],
      },
    );
  });

  it('returns each alias of a relation with its own arguments', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          people { totalCount }
          leaders: people(filter: { jobTitle: { in: ["CEO", "CTO"] } }) {
            totalCount
            edges { node { jobTitle } }
          }
          firstByTitle: people(orderBy: [{ jobTitle: AscNullsLast }], first: 1) {
            edges { node { jobTitle } }
          }
        `,
        filter: { id: { in: COMPANY_IDS } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const companiesById = Object.fromEntries(
      response.body.data.companies.edges.map(
        ({
          node,
        }: {
          node: {
            id: string;
            people: { totalCount: number };
            leaders: {
              totalCount: number;
              edges: { node: { jobTitle: string } }[];
            };
            firstByTitle: { edges: { node: { jobTitle: string } }[] };
          };
        }) => [
          node.id,
          {
            peopleCount: node.people.totalCount,
            leaderCount: node.leaders.totalCount,
            leaders: node.leaders.edges.map(({ node }) => node.jobTitle),
            firstByTitle: node.firstByTitle.edges.map(
              ({ node }) => node.jobTitle,
            ),
          },
        ],
      ),
    );

    expect(companiesById).toEqual({
      [FIRST_COMPANY_ID]: {
        peopleCount: 3,
        leaderCount: 1,
        leaders: ['CEO'],
        firstByTitle: ['Analyst'],
      },
      [SECOND_COMPANY_ID]: {
        peopleCount: 2,
        leaderCount: 1,
        leaders: ['CTO'],
        firstByTitle: ['CTO'],
      },
    });
  });

  it('applies variable arguments to an alias next to the plain relation', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query FindCompaniesWithScopedPeople(
          $filter: CompanyFilterInput
          $scopeFilter: PersonFilterInput
          $scopeOrderBy: [PersonOrderByInput]
          $scopeFirst: Int
        ) {
          companies(filter: $filter) {
            edges {
              node {
                id
                people {
                  edges {
                    node {
                      jobTitle
                    }
                  }
                }
                scope_column: people(
                  filter: $scopeFilter
                  orderBy: $scopeOrderBy
                  first: $scopeFirst
                ) {
                  edges {
                    node {
                      jobTitle
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        filter: { id: { in: COMPANY_IDS } },
        scopeFilter: { jobTitle: { neq: 'CEO' } },
        scopeOrderBy: [{ jobTitle: 'DescNullsLast' }],
        scopeFirst: 1,
      },
    });

    expect(response.body.errors).toBeUndefined();

    const scopedJobTitlesByCompanyId = Object.fromEntries(
      response.body.data.companies.edges.map(
        ({
          node,
        }: {
          node: {
            id: string;
            people: { edges: { node: { jobTitle: string } }[] };
            scope_column: { edges: { node: { jobTitle: string } }[] };
          };
        }) => [
          node.id,
          {
            people: node.people.edges.length,
            scoped: node.scope_column.edges.map(({ node }) => node.jobTitle),
          },
        ],
      ),
    );

    expect(scopedJobTitlesByCompanyId).toEqual({
      [FIRST_COMPANY_ID]: { people: 3, scoped: ['Buyer'] },
      [SECOND_COMPANY_ID]: { people: 2, scoped: ['Designer'] },
    });
  });

  it('orders related records by a relation field', async () => {
    const response = await findCompaniesWithPeople(
      'people(orderBy: [{ company: { name: AscNullsLast } }, { jobTitle: AscNullsLast }], first: 2)',
    );

    expect(response.body.errors).toBeUndefined();
    expect(getJobTitlesByCompanyId(response.body.data.companies.edges)).toEqual(
      {
        [FIRST_COMPANY_ID]: ['Analyst', 'Buyer'],
        [SECOND_COMPANY_ID]: ['CTO', 'Designer'],
      },
    );
  });

  it('resolves aliases on sub-fields, connection fields and relations without arguments', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter) {
            rows: edges {
              item: node {
                __proto__: id
                label: name
                everyone: people {
                  edges {
                    node {
                      fullName: name {
                        given: firstName
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { filter: { id: { in: [FIRST_COMPANY_ID] } } },
    });

    expect(response.body.errors).toBeUndefined();

    const [{ item }] = response.body.data.companies.rows;

    expect(item['__proto__']).toBe(FIRST_COMPANY_ID);
    expect(item.label).toBe('Nested arguments company one');
    expect(item.everyone.edges).toHaveLength(3);
    expect(item.everyone.edges[0].node.fullName).toHaveProperty('given');
  });

  it('ignores cursor arguments on a nested relation', async () => {
    const response = await findCompaniesWithPeople(
      'people(last: 1, after: "cursor", orderBy: [{ jobTitle: AscNullsLast }])',
    );

    expect(response.body.errors).toBeUndefined();
    expect(getJobTitlesByCompanyId(response.body.data.companies.edges)).toEqual(
      {
        [FIRST_COMPANY_ID]: ['Analyst', 'Buyer', 'CEO'],
        [SECOND_COMPANY_ID]: ['CTO', 'Designer'],
      },
    );
  });
});
