import gql from 'graphql-tag';
import { createOneObject, successfulApiRequest } from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const findOneCompanyQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
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

describe('findOneCompanyResolver (integration)', () => {
  it('should find one company', async () => {
    const companyName = generateRecordName();
    const createdCompanyId = await createOneObject('Company', {
      name: companyName,
    });
    const findOneCompanyQueryData = {
      query: findOneCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: createdCompanyId,
          },
        },
      },
    };

    successfulApiRequest(findOneCompanyQueryData).expect((res) => {
      const company = res.body.data.company;

      expect(company).toHaveProperty('name');
      expect(company.name).toEqual(companyName);

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
