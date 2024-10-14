import gql from 'graphql-tag';
import { createOneObject, successfulApiRequest } from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const updateCompanyQuery = gql`
  mutation UpdateCompany($companyId: ID, $data: CompanyUpdateInput) {
    updateCompany(id: $companyId, data: $data) {
      name
    }
  }
`;

const findCompanyQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
      name
    }
  }
`;

describe('updateCompanyResolver (integration)', () => {
  it('should update and persist the company update', async () => {
    const companyName = generateRecordName();
    const createdCompanyId = await createOneObject('Company', {
      name: companyName,
    });
    const updateCompanyQueryData = {
      query: updateCompanyQuery,
      variables: {
        companyId: createdCompanyId,
        data: {
          name: companyName,
        },
      },
    };

    successfulApiRequest(updateCompanyQueryData).expect((res) => {
      const updatedCompany = res.body.data.updateCompany;

      expect(updatedCompany).toHaveProperty('name');
      expect(updatedCompany.name).toEqual(companyName);
    });

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

    successfulApiRequest(findCompanyQueryData).expect((res) => {
      const company = res.body.data.company;

      expect(company).toHaveProperty('name');
      expect(company.name).toEqual(companyName);
    });
  });
});
