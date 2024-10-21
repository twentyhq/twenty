import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchViewSortsResolver (e2e)', () => {
  it('should find many searchViewSorts', () => {
    const queryData = {
      query: `
        query searchViewSorts {
          searchViewSorts {
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
        const data = res.body.data.searchViewSorts;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchViewSorts = edges[0].node;

          expect(searchViewSorts).toHaveProperty('fieldMetadataId');
          expect(searchViewSorts).toHaveProperty('direction');
          expect(searchViewSorts).toHaveProperty('id');
          expect(searchViewSorts).toHaveProperty('createdAt');
          expect(searchViewSorts).toHaveProperty('updatedAt');
          expect(searchViewSorts).toHaveProperty('deletedAt');
          expect(searchViewSorts).toHaveProperty('viewId');
        }
      });
  });
});
