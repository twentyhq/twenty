import gql from 'graphql-tag';
import { successfulApiRequest } from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const createCompaniesQuery = gql`
  mutation CreateCompanies($data: [CompanyCreateInput!]!) {
    createCompanies(data: $data) {
      id
      name
      employees
      idealCustomerProfile
      position
      createdAt
      updatedAt
      deletedAt
      accountOwnerId
      tagline
      workPolicy
      visaSponsorship
    }
  }
`;

describe('createCompaniesResolver (integration)', () => {
  it('should create and return  companies', async () => {
    const companyName1 = generateRecordName();
    const companyName2 = generateRecordName();

    const queryData = {
      query: createCompaniesQuery,
      variables: {
        data: [
          {
            name: companyName1,
          },
          {
            name: companyName2,
          },
        ],
      },
    };

    const createdCompanies = await successfulApiRequest(queryData);

    expect(createdCompanies.body.data.createCompanies).toHaveLength(2);

    createdCompanies.body.data.createCompanies.forEach((company) => {
      expect(company).toHaveProperty('name');
      expect([companyName1, companyName2]).toContain(company.name);

      expect(company).toHaveProperty('employees');
      expect(company).toHaveProperty('idealCustomerProfile');
      expect(company).toHaveProperty('position');
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('createdAt');
      expect(company).toHaveProperty('updatedAt');
      expect(company).toHaveProperty('deletedAt');
      expect(company).toHaveProperty('accountOwnerId');
      expect(company).toHaveProperty('tagline');
      expect(company).toHaveProperty('workPolicy');
      expect(company).toHaveProperty('visaSponsorship');
    });
  });
});
