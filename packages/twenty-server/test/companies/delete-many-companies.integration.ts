import gql from 'graphql-tag';
import {
  createManyObjects,
  successfulApiRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const deleteCompaniesQuery = gql`
  mutation DeleteCompanies($filter: CompanyFilterInput) {
    deleteCompanies(filter: $filter) {
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

describe('deleteCompaniesResolver (integration)', () => {
  it('should delete companies and hide them from simple queries', async () => {
    const companiesIds = await createManyObjects('Company', [
      { name: generateRecordName() },
      { name: generateRecordName() },
    ]);

    const filter = {
      id: {
        in: companiesIds,
      },
    };

    const deleteCompaniesQueryData = {
      query: deleteCompaniesQuery,
      variables: {
        filter,
      },
    };

    const deleteCompaniesResponse = await successfulApiRequest(
      deleteCompaniesQueryData,
    );

    const deleteCompanies = deleteCompaniesResponse.body.data.deleteCompanies;

    expect(deleteCompanies).toHaveLength(companiesIds.length);

    deleteCompanies.forEach((company) => {
      expect(company.deletedAt).toBeTruthy();
    });

    const findCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter,
      },
    };

    const findCompaniesResponse = await successfulApiRequest(
      findCompaniesQueryData,
    );

    expect(findCompaniesResponse.body.data.companies.edges).toHaveLength(0);

    const findDeletedCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter: {
          id: {
            in: companiesIds,
          },
          deletedAt: {
            not: 'NULL',
          },
        },
      },
    };

    const findDeletedCompaniesResponse = await successfulApiRequest(
      findDeletedCompaniesQueryData,
    );

    expect(findDeletedCompaniesResponse.body.data.companies.edges).toHaveLength(
      companiesIds.length,
    );
  });
});
