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

  it('rejects aliases of one relation with different arguments', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          firstPerson: people(first: 1) { totalCount }
          twoPeople: people(first: 2) { totalCount }
        `,
        filter: { id: { in: [FIRST_COMPANY_ID] } },
      }),
    );

    expect(response.body.data?.companies ?? null).toBeNull();
    expect(response.body.errors?.[0]?.message).toContain(
      'Conflicting arguments for "people"',
    );
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
