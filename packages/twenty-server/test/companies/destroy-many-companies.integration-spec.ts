import gql from 'graphql-tag';
import {
  apiRequest,
  createManyObjects,
  successfulApiRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const destroyCompaniesQuery = gql`
  mutation DestroyCompanies($filter: CompanyFilterInput) {
    destroyCompanies(filter: $filter) {
      deletedAt
    }
  }
`;

const findCompaniesQuery = gql`
  query Companies($filter: CompanyFilterInput) {
    companies(filter: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

describe('destroyCompaniesResolver (integration)', () => {
  it('should destroy companies and hide them from simple queries', async () => {
    const companiesIds = await createManyObjects('Company', [
      { name: generateRecordName() },
      { name: generateRecordName() },
    ]);

    const filter = {
      id: {
        in: companiesIds,
      },
    };

    const destroyCompaniesQueryData = {
      query: destroyCompaniesQuery,
      variables: {
        filter,
      },
    };

    const destroyCompaniesResponse = await successfulApiRequest(
      destroyCompaniesQueryData,
    );

    expect(destroyCompaniesResponse.body.data.destroyCompanies).toHaveLength(
      companiesIds.length,
    );

    const findCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter,
      },
    };

    const findCompaniesResponse = await successfulApiRequest(
      findCompaniesQueryData,
    );

    expect(
      findCompaniesResponse.body.data.companies.edges.filter((c) =>
        companiesIds.includes(c.node.id),
      ),
    ).toHaveLength(0);

    const findDeletedCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter: {
          id: {
            in: companiesIds,
          },
          not: {
            deletedAt: {
              is: 'NULL',
            },
          },
        },
      },
    };

    const findDeletedCompaniesResponse = await apiRequest(
      findDeletedCompaniesQueryData,
    );

    expect(findDeletedCompaniesResponse.body.data.companies.edges).toHaveLength(
      0,
    );
  });
});
