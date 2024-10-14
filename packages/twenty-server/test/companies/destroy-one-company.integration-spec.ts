import gql from 'graphql-tag';
import {
  apiRequest,
  createOneObject,
  successfulApiRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const destroyCompanyQuery = gql`
  mutation DestroyCompany($companyId: ID!) {
    destroyCompany(id: $companyId) {
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

describe('destroyCompanyResolver (integration)', () => {
  it('should destroy a company and hide it from simple queries', async () => {
    const companyName = generateRecordName();
    const createdCompanyId = await createOneObject('Company', {
      name: companyName,
    });

    const destroyCompanyQueryData = {
      query: destroyCompanyQuery,
      variables: {
        companyId: createdCompanyId,
      },
    };

    const destroyCompanyResponse = await successfulApiRequest(
      destroyCompanyQueryData,
    );

    expect(destroyCompanyResponse.body.data.destroyCompany).toBeTruthy();

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

    expect(findDeletedCompanyResponse.body.data.company).toBeNull();
  });
});
