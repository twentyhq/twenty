import gql from 'graphql-tag';
import {
  apiRequest,
  createOneObject,
  successfulApiRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const deleteCompanyQuery = gql`
  mutation DeleteCompany($companyId: ID!) {
    deleteCompany(id: $companyId) {
      deletedAt
    }
  }
`;

const findCompanyQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
      id
    }
  }
`;

const findCompaniesQuery = gql`
  query Companies {
    companies {
      edges {
        node {
          id
        }
      }
    }
  }
`;

describe('deleteCompanyResolver (integration)', () => {
  it('should delete a company and hide it from simple queries', async () => {
    const companyName = generateRecordName();
    const createdCompanyId = await createOneObject('Company', {
      name: companyName,
    });

    const deleteCompanyQueryData = {
      query: deleteCompanyQuery,
      variables: {
        companyId: createdCompanyId,
      },
    };

    const deleteCompanyResponse = await successfulApiRequest(
      deleteCompanyQueryData,
    );

    expect(
      deleteCompanyResponse.body.data.deleteCompany.deletedAt,
    ).toBeTruthy();

    const findCompanyQueryData = {
      query: findCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: createdCompanyId,
          },
        },
      },
    };

    const findCompanyResponse = await apiRequest(findCompanyQueryData);

    expect(findCompanyResponse.body.data.company).toBeNull();

    const findCompaniesResponse = await successfulApiRequest({
      query: findCompaniesQuery,
    });

    expect(
      findCompaniesResponse.body.data.companies.edges.filter(
        (c) => c.node.id === createdCompanyId,
      ),
    ).toHaveLength(0);

    const findDeletedCompanyQueryData = {
      query: findCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: createdCompanyId,
          },
          not: {
            deletedAt: {
              is: 'NULL',
            },
          },
        },
      },
    };

    const findDeletedCompanyResponse = await apiRequest(
      findDeletedCompanyQueryData,
    );

    expect(findDeletedCompanyResponse.body.data.company.id).toEqual(
      createdCompanyId,
    );
  });
});
