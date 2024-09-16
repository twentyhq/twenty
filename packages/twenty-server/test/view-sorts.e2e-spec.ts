import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('viewSortsResolver (e2e)', () => {
  it('should find many viewSorts', () => {
    const queryData = {
      query: `
        query viewSorts {
          viewSorts {
            edges {
              node {
                fieldMetadataId
                direction
                id
                createdAt
                updatedAt
                viewId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.viewSorts;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const viewsorts = edges[0].node;

          expect(viewsorts).toHaveProperty('fieldMetadataId');
          expect(viewsorts).toHaveProperty('direction');
          expect(viewsorts).toHaveProperty('id');
          expect(viewsorts).toHaveProperty('createdAt');
          expect(viewsorts).toHaveProperty('updatedAt');
          expect(viewsorts).toHaveProperty('viewId');
        }
      });
  });
});
