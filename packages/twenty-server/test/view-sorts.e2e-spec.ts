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
                deletedAt
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
          const viewSorts = edges[0].node;

          expect(viewSorts).toHaveProperty('fieldMetadataId');
          expect(viewSorts).toHaveProperty('direction');
          expect(viewSorts).toHaveProperty('id');
          expect(viewSorts).toHaveProperty('createdAt');
          expect(viewSorts).toHaveProperty('updatedAt');
          expect(viewSorts).toHaveProperty('deletedAt');
          expect(viewSorts).toHaveProperty('viewId');
        }
      });
  });
});
