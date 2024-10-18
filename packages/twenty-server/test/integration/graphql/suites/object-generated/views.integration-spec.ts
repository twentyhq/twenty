import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('viewsResolver (e2e)', () => {
  it('should find many views', () => {
    const queryData = {
      query: `
        query views {
          views {
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
        const data = res.body.data.views;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const views = edges[0].node;

          expect(views).toHaveProperty('name');
          expect(views).toHaveProperty('objectMetadataId');
          expect(views).toHaveProperty('type');
          expect(views).toHaveProperty('key');
          expect(views).toHaveProperty('icon');
          expect(views).toHaveProperty('kanbanFieldMetadataId');
          expect(views).toHaveProperty('position');
          expect(views).toHaveProperty('isCompact');
          expect(views).toHaveProperty('id');
          expect(views).toHaveProperty('createdAt');
          expect(views).toHaveProperty('updatedAt');
          expect(views).toHaveProperty('deletedAt');
        }
      });
  });
});
