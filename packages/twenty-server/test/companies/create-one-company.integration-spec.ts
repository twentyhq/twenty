import gql from 'graphql-tag';
import { successfulApiRequest } from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const query = gql`
  mutation CreateCompany($data: CompanyCreateInput) {
    createCompany(data: $data) {
      name
      employees
      idealCustomerProfile
      position
      id
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

describe('createCompanyResolver (integration)', () => {
  it('should create and return a company', () => {
    const companyName = generateRecordName();
    const queryData = {
      query,
      variables: {
        data: {
          name: companyName,
        },
      },
    };

    return successfulApiRequest(queryData).expect((res) => {
      const createdCompany = res.body.data.createCompany;

      expect(createdCompany).toHaveProperty('name');
      expect(createdCompany.name).toEqual(companyName);

      expect(createdCompany).toHaveProperty('employees');
      expect(createdCompany).toHaveProperty('idealCustomerProfile');
      expect(createdCompany).toHaveProperty('position');
      expect(createdCompany).toHaveProperty('id');
      expect(createdCompany).toHaveProperty('createdAt');
      expect(createdCompany).toHaveProperty('updatedAt');
      expect(createdCompany).toHaveProperty('deletedAt');
      expect(createdCompany).toHaveProperty('accountOwnerId');
      expect(createdCompany).toHaveProperty('tagline');
      expect(createdCompany).toHaveProperty('workPolicy');
      expect(createdCompany).toHaveProperty('visaSponsorship');
    });
  });
});
