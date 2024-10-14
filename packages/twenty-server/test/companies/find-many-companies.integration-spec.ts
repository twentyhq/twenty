import gql from 'graphql-tag';
import { successfulApiRequest } from 'test/utils/api-requests';

describe('companiesResolver (integration)', () => {
  it('should find many companies', () => {
    const queryData = {
      query: gql`
        query companies {
          companies {
            edges {
              node {
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
          }
        }
      `,
    };

    return successfulApiRequest(queryData).expect((res) => {
      const data = res.body.data.companies;

      expect(data).toBeDefined();
      expect(Array.isArray(data.edges)).toBe(true);

      const edges = data.edges;

      if (edges.length > 0) {
        const companies = edges[0].node;

        expect(companies).toHaveProperty('name');
        expect(companies).toHaveProperty('employees');
        expect(companies).toHaveProperty('idealCustomerProfile');
        expect(companies).toHaveProperty('position');
        expect(companies).toHaveProperty('id');
        expect(companies).toHaveProperty('createdAt');
        expect(companies).toHaveProperty('updatedAt');
        expect(companies).toHaveProperty('deletedAt');
        expect(companies).toHaveProperty('accountOwnerId');
        expect(companies).toHaveProperty('tagline');
        expect(companies).toHaveProperty('workPolicy');
        expect(companies).toHaveProperty('visaSponsorship');
      }
    });
  });
});
