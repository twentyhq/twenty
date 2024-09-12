import request from 'supertest';

describe('CompanyResolver (e2e)', () => {
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

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
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
