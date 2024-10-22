import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchViewsResolver (e2e)', () => {
  it('should find many searchViews', () => {
    const queryData = {
      query: `
        query searchViews {
          searchViews {
            edges {
              node {
                name
                objectMetadataId
                type
                key
                icon
                kanbanFieldMetadataId
                position
                isCompact
                id
                createdAt
                updatedAt
                deletedAt
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
        const data = res.body.data.searchViews;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchViews = edges[0].node;

          expect(searchViews).toHaveProperty('name');
          expect(searchViews).toHaveProperty('objectMetadataId');
          expect(searchViews).toHaveProperty('type');
          expect(searchViews).toHaveProperty('key');
          expect(searchViews).toHaveProperty('icon');
          expect(searchViews).toHaveProperty('kanbanFieldMetadataId');
          expect(searchViews).toHaveProperty('position');
          expect(searchViews).toHaveProperty('isCompact');
          expect(searchViews).toHaveProperty('id');
          expect(searchViews).toHaveProperty('createdAt');
          expect(searchViews).toHaveProperty('updatedAt');
          expect(searchViews).toHaveProperty('deletedAt');
        }
      });
  });
});
