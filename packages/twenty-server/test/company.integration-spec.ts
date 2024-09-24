import request from 'supertest';

const graphqlClient = request(`http://localhost:${APP_PORT}`);

describe('CompanyResolver (integration)', () => {
  it('should find many companies', () => {
    const queryData = {
      query: `
        query Companies {
          companies {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
    };

    return graphqlClient
      .post('/graphql')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.companies;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const company = edges[0].node;

          expect(company).toBeDefined();
          expect(company).toHaveProperty('id');
          expect(company).toHaveProperty('name');
        }
      });
  });
});
