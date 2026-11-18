import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
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

  it('limits related records by id when first comes without orderBy', async () => {
    const response = await findCompaniesWithPeople('people(first: 1)');

    expect(response.body.errors).toBeUndefined();
    expect(getJobTitlesByCompanyId(response.body.data.companies.edges)).toEqual(
      {
        [FIRST_COMPANY_ID]: ['CEO'],
        [SECOND_COMPANY_ID]: ['CTO'],
      },
    );
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

  it('applies alias arguments to the records of a group by query', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query CompaniesGroupByWithScopedPeople(
          $groupBy: [CompanyGroupByInput!]!
          $filter: CompanyFilterInput
          $scopeFilter: PersonFilterInput
          $scopeOrderBy: [PersonOrderByInput]
          $scopeFirst: Int
        ) {
          companiesGroupBy(groupBy: $groupBy, filter: $filter) {
            groupByDimensionValues
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
        groupBy: [{ name: true }],
        filter: { id: { in: COMPANY_IDS } },
        scopeFilter: { jobTitle: { neq: 'CEO' } },
        scopeOrderBy: [{ jobTitle: 'DescNullsLast' }],
        scopeFirst: 1,
      },
    });

    expect(response.body.errors).toBeUndefined();

    const scopedJobTitlesByCompanyId = Object.fromEntries(
      response.body.data.companiesGroupBy.flatMap(
        ({
          edges,
        }: {
          edges: {
            node: {
              id: string;
              people: { edges: { node: { jobTitle: string } }[] };
              scope_column: { edges: { node: { jobTitle: string } }[] };
            };
          }[];
        }) =>
          edges.map(({ node }) => [
            node.id,
            {
              people: node.people.edges.length,
              scoped: node.scope_column.edges.map(({ node }) => node.jobTitle),
            },
          ]),
      ),
    );

    expect(scopedJobTitlesByCompanyId).toEqual({
      [FIRST_COMPANY_ID]: { people: 3, scoped: ['Buyer'] },
      [SECOND_COMPANY_ID]: { people: 2, scoped: ['Designer'] },
    });
  });

  it('keeps aliases nested under a relation in the records of a group by query', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query CompaniesGroupByWithNestedAlias(
          $groupBy: [CompanyGroupByInput!]!
          $filter: CompanyFilterInput
        ) {
          companiesGroupBy(groupBy: $groupBy, filter: $filter) {
            edges {
              node {
                id
                people {
                  edges {
                    node {
                      employer: company {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [{ name: true }],
        filter: { id: { in: [FIRST_COMPANY_ID] } },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const [{ node }] = response.body.data.companiesGroupBy[0].edges;

    expect(node.people.edges.length).toBeGreaterThan(0);
    expect(
      node.people.edges.map(
        ({ node: person }: { node: { employer: { id: string } } }) =>
          person.employer.id,
      ),
    ).toEqual(node.people.edges.map(() => FIRST_COMPANY_ID));
  });

  it('keeps aliases named like internal selection data as ordinary fields', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedPeople($filter: PersonFilterInput) {
          people(filter: $filter) {
            edges {
              node {
                employer: company {
                  __fieldName: id
                  __arguments: name
                }
              }
            }
          }
        }
      `,
      variables: { filter: { id: { eq: buildPersonId(1) } } },
    });

    expect(response.body.errors).toBeUndefined();

    const [{ node }] = response.body.data.people.edges;

    expect(node.employer).toEqual({
      __fieldName: FIRST_COMPANY_ID,
      __arguments: 'Nested arguments company one',
    });
  });

  it('serves relations aliased with Object.prototype member names', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedPeople($filter: PersonFilterInput) {
          people(filter: $filter) {
            edges {
              node {
                constructor: company {
                  id
                }
                toString: company {
                  name
                }
              }
            }
          }
        }
      `,
      variables: { filter: { id: { eq: buildPersonId(1) } } },
    });

    expect(response.body.errors).toBeUndefined();

    const [{ node }] = response.body.data.people.edges;

    expect(node.constructor).toEqual({ id: FIRST_COMPANY_ID });
    expect(node.toString).toEqual({ name: 'Nested arguments company one' });
  });

  it('serves a response key reused for different fields under separate aliases', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter) {
            byName: edges {
              node {
                value: name
                people(first: 1) {
                  totalCount
                }
              }
            }
            byId: edges {
              node {
                value: id
                people(first: 1) {
                  edges {
                    node {
                      id
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

    const { byName, byId } = response.body.data.companies;

    expect(byName[0].node.value).toBe('Nested arguments company one');
    expect(byName[0].node.people.totalCount).toBe(3);
    expect(byId[0].node.value).toBe(FIRST_COMPANY_ID);
    expect(byId[0].node.people.edges).toHaveLength(1);
  });

  it.each([
    ['another field', 'label: name\n                label: id'],
    [
      'other arguments',
      'scoped: people(first: 1) { totalCount }\n                scoped: people(first: 2) { totalCount }',
    ],
  ])(
    'rejects a response key that names %s in the same selection',
    async (_, conflictingFields) => {
      const response = await makeGraphqlApiRequest({
        query: gql`
          query AliasedCompanies($filter: CompanyFilterInput) {
            companies(filter: $filter) {
              edges {
                node {
                  ${conflictingFields}
                }
              }
            }
          }
        `,
        variables: { filter: { id: { in: [FIRST_COMPANY_ID] } } },
      });

      expect(response.body.data?.companies ?? null).toBeNull();
      expect(response.body.errors?.[0]?.message).toMatch(
        /^Fields "(label|scoped)" conflict/,
      );
    },
  );

  it('serves a relation aliased to __proto__', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter) {
            edges {
              node {
                __proto__: people(first: 1) {
                  edges {
                    node {
                      id
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

    const [{ node }] = response.body.data.companies.edges;

    expect(Object.keys(node)).toEqual(['__proto__']);
    expect(node['__proto__'].edges).toHaveLength(1);
  });

  it('serves a relation aliased to the name of a selected aggregate', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter) {
            totalCount
            edges {
              node {
                totalCount: people(first: 1) {
                  totalCount
                  edges {
                    node {
                      id
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

    const { totalCount, edges } = response.body.data.companies;

    expect(totalCount).toBe(1);
    expect(edges[0].node.totalCount.totalCount).toBe(3);
    expect(edges[0].node.totalCount.edges).toHaveLength(1);
  });

  it.each(['name', 'addressAddressCity'])(
    'serves a relation aliased to the column %s next to that column',
    async (responseKey) => {
      const response = await makeGraphqlApiRequest({
        query: gql`
          query AliasedCompanies($filter: CompanyFilterInput) {
            companies(filter: $filter) {
              edges {
                node {
                  label: name
                  ${responseKey}: people(first: 1) {
                    edges {
                      node {
                        id
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

      const [{ node }] = response.body.data.companies.edges;

      expect(node.label).toBe('Nested arguments company one');
      expect(node[responseKey].edges).toHaveLength(1);
    },
  );

  it('serves one relation with other arguments under separate edges aliases', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query AliasedCompanies($filter: CompanyFilterInput) {
          companies(filter: $filter) {
            first: edges {
              node {
                people(orderBy: [{ jobTitle: AscNullsLast }], first: 1) {
                  edges {
                    node {
                      jobTitle
                    }
                  }
                }
              }
            }
            second: edges {
              node {
                people(orderBy: [{ jobTitle: AscNullsLast }], first: 2) {
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
      variables: { filter: { id: { in: [FIRST_COMPANY_ID] } } },
    });

    expect(response.body.errors).toBeUndefined();

    const { first, second } = response.body.data.companies;

    expect(first[0].node.people.edges).toEqual([
      { node: { jobTitle: 'Analyst' } },
    ]);
    expect(second[0].node.people.edges).toEqual([
      { node: { jobTitle: 'Analyst' } },
      { node: { jobTitle: 'Buyer' } },
    ]);
  });

  it('serves aliased relations with their own arguments in a mutation result', async () => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
          id
          everyone: people { totalCount }
          leaders: people(filter: { jobTitle: { eq: "CEO" } }) {
            edges { node { jobTitle } }
          }
        `,
        data: { name: 'Nested arguments company one' },
        recordId: FIRST_COMPANY_ID,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCompany).toEqual({
      id: FIRST_COMPANY_ID,
      everyone: { totalCount: 3 },
      leaders: { edges: [{ node: { jobTitle: 'CEO' } }] },
    });
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

  it('counts every matching related record when first limits the loaded ones', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          people(orderBy: [{ jobTitle: AscNullsLast }], first: 1) {
            totalCount
            edges { node { jobTitle } }
          }
        `,
        filter: { id: { in: COMPANY_IDS } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const peopleByCompanyId = Object.fromEntries(
      response.body.data.companies.edges.map(
        ({
          node,
        }: {
          node: {
            id: string;
            people: {
              totalCount: number;
              edges: { node: { jobTitle: string } }[];
            };
          };
        }) => [
          node.id,
          {
            totalCount: node.people.totalCount,
            jobTitles: node.people.edges.map(({ node }) => node.jobTitle),
          },
        ],
      ),
    );

    expect(peopleByCompanyId).toEqual({
      [FIRST_COMPANY_ID]: { totalCount: 3, jobTitles: ['Analyst'] },
      [SECOND_COMPANY_ID]: { totalCount: 2, jobTitles: ['CTO'] },
    });
  });

  it('applies nested arguments and counts through a to-one relation', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: `
          id
          company {
            people(orderBy: [{ jobTitle: AscNullsLast }], first: 1) {
              totalCount
              edges { node { jobTitle } }
            }
          }
        `,
        filter: { id: { eq: buildPersonId(1) } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const [{ node }] = response.body.data.people.edges;

    expect(node.company.people.totalCount).toBe(3);
    expect(node.company.people.edges).toEqual([
      { node: { jobTitle: 'Analyst' } },
    ]);
  });

  it('keeps root aggregates apart from the counts of relations under a to-one relation', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query People($filter: PersonFilterInput) {
          people(filter: $filter) {
            totalCount
            edges {
              node {
                id
                company {
                  people(first: 1) {
                    totalCount
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        filter: { id: { in: [buildPersonId(1), buildPersonId(4)] } },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const { totalCount, edges } = response.body.data.people;

    expect(totalCount).toBe(2);
    expect(
      Object.fromEntries(
        edges.map(
          ({
            node,
          }: {
            node: {
              id: string;
              company: { people: { totalCount: number } };
            };
          }) => [node.id, node.company.people.totalCount],
        ),
      ),
    ).toEqual({ [buildPersonId(1)]: 3, [buildPersonId(4)]: 2 });
  });

  it('counts every related record of a single record when first limits the loaded ones', async () => {
    const response = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
          people(first: 1) {
            totalCount
            edges { node { id } }
          }
        `,
        filter: { id: { eq: FIRST_COMPANY_ID } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.company.people.totalCount).toBe(3);
    expect(response.body.data.company.people.edges).toHaveLength(1);
  });

  it('counts every related record in the records of a group by query', async () => {
    const response = await makeGraphqlApiRequest({
      query: gql`
        query CompaniesGroupByWithNestedCount(
          $groupBy: [CompanyGroupByInput!]!
          $filter: CompanyFilterInput
        ) {
          companiesGroupBy(groupBy: $groupBy, filter: $filter) {
            edges {
              node {
                id
                people(first: 1) {
                  totalCount
                }
              }
            }
          }
        }
      `,
      variables: {
        groupBy: [{ name: true }],
        filter: { id: { in: COMPANY_IDS } },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const countsByCompanyId = Object.fromEntries(
      response.body.data.companiesGroupBy.flatMap(
        (group: {
          edges: {
            node: { id: string; people: { totalCount: number } };
          }[];
        }) => group.edges.map(({ node }) => [node.id, node.people.totalCount]),
      ),
    );

    expect(countsByCompanyId).toEqual({
      [FIRST_COMPANY_ID]: 3,
      [SECOND_COMPANY_ID]: 2,
    });
  });

  it('counts every related record in a mutation result when first limits the loaded ones', async () => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
          people(first: 1) {
            totalCount
            edges { node { id } }
          }
        `,
        data: { name: 'Nested arguments company two' },
        recordId: SECOND_COMPANY_ID,
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCompany.people.totalCount).toBe(2);
    expect(response.body.data.updateCompany.people.edges).toHaveLength(1);
  });

  it('rejects malformed nested arguments instead of ignoring them', async () => {
    const response = await findCompaniesWithPeople('people(first: -1)');

    expect(response.body.data?.companies ?? null).toBeNull();
    expect(response.body.errors?.[0]?.message).toContain('"first"');
  });

  it('rejects an invalid nested filter before running the mutation', async () => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: `
          id
          people(filter: { unknownField: { eq: "x" } }) {
            edges { node { id } }
          }
        `,
        data: { name: 'Renamed by a failing mutation' },
        recordId: FIRST_COMPANY_ID,
      }),
    );

    expect(response.body.errors).toBeDefined();

    const companyResponse = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'name',
        filter: { id: { eq: FIRST_COMPANY_ID } },
      }),
    );

    expect(companyResponse.body.data.company.name).toBe(
      'Nested arguments company one',
    );
  });
});
