import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';
import { TEST_COMPANY_1_ID } from 'test/integration/constants/test-company-ids.constants';
import {
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
} from 'test/integration/constants/test-person-ids.constants';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const PERSON_IDS = [
  TEST_PERSON_1_ID,
  TEST_PERSON_2_ID,
  TEST_PERSON_3_ID,
  TEST_PERSON_4_ID,
];

const PERSON_FIELDS = `
  id
  jobTitle
  position
  companyId
  name {
    firstName
    lastName
  }
  emails {
    primaryEmail
    additionalEmails
  }
`;

type SelectedPersonFields = {
  id: string;
  jobTitle: string;
  position: number;
  companyId: string | null;
  name: { firstName: string; lastName: string };
  emails: { primaryEmail: string; additionalEmails: string[] | null };
};

type PersonWithCompany = {
  id: string;
  company: { id: string; name: string } | null;
};

const pickSelectedPersonFields = (
  person: SelectedPersonFields,
): SelectedPersonFields => ({
  id: person.id,
  jobTitle: person.jobTitle,
  position: person.position,
  companyId: person.companyId,
  name: person.name,
  emails: person.emails,
});

const queryGraphql = async ({
  query,
  variables = {},
}: {
  query: ReturnType<typeof gql>;
  variables?: Record<string, unknown>;
}) => {
  const response = await makeGraphqlApiRequest({ query, variables });

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

describe('REST and GraphQL parity', () => {
  beforeAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');

    await makeRestApiRequest({
      method: 'post',
      path: '/companies',
      body: { id: TEST_COMPANY_1_ID, name: 'Parity company' },
    }).expect(201);

    for (const [index, personId] of PERSON_IDS.entries()) {
      await makeRestApiRequest({
        method: 'post',
        path: '/people',
        body: {
          id: personId,
          jobTitle: `Parity job ${index}`,
          position: index,
          name: { firstName: `First ${index}`, lastName: `Last ${index}` },
          emails: { primaryEmail: `parity-${index}@example.com` },
          ...(index < 3 ? { companyId: TEST_COMPANY_1_ID } : {}),
        },
      }).expect(201);
    }
  });

  afterAll(async () => {
    await deleteAllRecords('person');
    await deleteAllRecords('company');
  });

  it('returns the same records, count and cursors for a filtered and ordered page', async () => {
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: '/people?filter=position[gte]:1&order_by=position[DescNullsLast]&limit=2&depth=0',
    }).expect(200);

    const { people } = await queryGraphql({
      query: gql`
      query {
        people(
          filter: { position: { gte: 1 } }
          orderBy: [{ position: DescNullsLast }]
          first: 2
        ) {
          totalCount
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }
          edges {
            node {
              ${PERSON_FIELDS}
            }
          }
        }
      }
    `,
    });

    expect(restResponse.body.data.people.map(pickSelectedPersonFields)).toEqual(
      people.edges.map(({ node }: { node: SelectedPersonFields }) => node),
    );
    expect(restResponse.body.totalCount).toBe(people.totalCount);
    expect(restResponse.body.totalCount).toBe(3);
    expect(restResponse.body.pageInfo).toMatchObject(people.pageInfo);
  });

  it('accepts a cursor issued by the other API', async () => {
    const firstRestPage = await makeRestApiRequest({
      method: 'get',
      path: '/people?order_by=position[AscNullsLast]&limit=2&depth=0',
    }).expect(200);

    const nextPageQuery = gql`
      query NextPage($after: String) {
        people(orderBy: [{ position: AscNullsLast }], first: 2, after: $after) {
          pageInfo {
            endCursor
          }
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    const graphqlNextPage = await queryGraphql({
      query: nextPageQuery,
      variables: { after: firstRestPage.body.pageInfo.endCursor },
    });
    const graphqlFirstPage = await queryGraphql({ query: nextPageQuery });

    const restNextPage = await makeRestApiRequest({
      method: 'get',
      path: `/people?order_by=position[AscNullsLast]&limit=2&depth=0&starting_after=${graphqlFirstPage.people.pageInfo.endCursor}`,
    }).expect(200);

    const expectedNextPageIds = [TEST_PERSON_3_ID, TEST_PERSON_4_ID];

    expect(
      graphqlNextPage.people.edges.map(
        ({ node }: { node: { id: string } }) => node.id,
      ),
    ).toEqual(expectedNextPageIds);
    expect(
      restNextPage.body.data.people.map(({ id }: { id: string }) => id),
    ).toEqual(expectedNextPageIds);
  });

  it('returns the same record for find one', async () => {
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: `/people/${TEST_PERSON_2_ID}?depth=0`,
    }).expect(200);

    const { person } = await queryGraphql({
      query: gql`
        query Person($id: UUID!) {
          person(filter: { id: { eq: $id } }) {
            ${PERSON_FIELDS}
          }
        }
      `,
      variables: { id: TEST_PERSON_2_ID },
    });

    expect(pickSelectedPersonFields(restResponse.body.data.person)).toEqual(
      person,
    );
  });

  it('returns the same many-to-one relation, including when it is empty', async () => {
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: '/people?order_by=position[AscNullsLast]&depth=1',
    }).expect(200);

    const { people } = await queryGraphql({
      query: gql`
        query {
          people(orderBy: [{ position: AscNullsLast }]) {
            edges {
              node {
                id
                company {
                  id
                  name
                }
              }
            }
          }
        }
      `,
    });

    expect(
      restResponse.body.data.people.map((person: PersonWithCompany) => ({
        id: person.id,
        company: isDefined(person.company)
          ? { id: person.company.id, name: person.company.name }
          : null,
      })),
    ).toEqual(
      people.edges.map(({ node }: { node: PersonWithCompany }) => node),
    );
    expect(people.edges[3].node.company).toBeNull();
  });

  it('returns the same one-to-many relation', async () => {
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: `/companies/${TEST_COMPANY_1_ID}?depth=1`,
    }).expect(200);

    const { company } = await queryGraphql({
      query: gql`
        query Company($id: UUID!) {
          company(filter: { id: { eq: $id } }) {
            id
            people {
              edges {
                node {
                  id
                  jobTitle
                }
              }
            }
          }
        }
      `,
      variables: { id: TEST_COMPANY_1_ID },
    });

    const sortById = <TRecord extends { id: string }>(records: TRecord[]) =>
      [...records].sort((left, right) => left.id.localeCompare(right.id));

    expect(
      sortById(
        restResponse.body.data.company.people.map(
          ({ id, jobTitle }: { id: string; jobTitle: string }) => ({
            id,
            jobTitle,
          }),
        ),
      ),
    ).toEqual(
      sortById(
        company.people.edges.map(
          ({ node }: { node: { id: string; jobTitle: string } }) => node,
        ),
      ),
    );
    expect(company.people.edges).toHaveLength(3);
  });

  it('returns the same groups and counts for group by', async () => {
    const restResponse = await makeRestApiRequest({
      method: 'get',
      path: `/people/groupBy?group_by=${encodeURIComponent('[{"companyId":true}]')}&aggregate=${encodeURIComponent('["totalCount"]')}`,
    }).expect(200);

    const { peopleGroupBy } = await queryGraphql({
      query: gql`
        query {
          peopleGroupBy(groupBy: [{ companyId: true }]) {
            groupByDimensionValues
            totalCount
          }
        }
      `,
    });

    const toComparableGroups = (
      groups: {
        groupByDimensionValues: (string | null)[];
        totalCount: number;
      }[],
    ) =>
      groups
        .map(({ groupByDimensionValues, totalCount }) => ({
          groupByDimensionValues,
          totalCount: Number(totalCount),
        }))
        .sort((left, right) => left.totalCount - right.totalCount);

    expect(toComparableGroups(restResponse.body)).toEqual(
      toComparableGroups(peopleGroupBy),
    );
    expect(toComparableGroups(peopleGroupBy)).toEqual([
      { groupByDimensionValues: [null], totalCount: 1 },
      { groupByDimensionValues: [TEST_COMPANY_1_ID], totalCount: 3 },
    ]);
  });
});
