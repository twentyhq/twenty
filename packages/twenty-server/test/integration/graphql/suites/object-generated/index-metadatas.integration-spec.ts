import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('indexMetadatasResolver (e2e)', () => {
  it('should find many indexMetadatas', () => {
    const queryData = {
      query: `
        query indexMetadatas {
          indexMetadatas {
            edges {
              node {
                id
                name
                isCustom
                isUnique
                indexWhereClause
                indexType
                createdAt
                updatedAt
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
        const data = res.body.data.indexMetadatas;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const indexMetadatas = edges[0].node;

          expect(indexMetadatas).toHaveProperty('id');
          expect(indexMetadatas).toHaveProperty('name');
          expect(indexMetadatas).toHaveProperty('isCustom');
          expect(indexMetadatas).toHaveProperty('isUnique');
          expect(indexMetadatas).toHaveProperty('indexWhereClause');
          expect(indexMetadatas).toHaveProperty('indexType');
          expect(indexMetadatas).toHaveProperty('createdAt');
          expect(indexMetadatas).toHaveProperty('updatedAt');
        }
      });
  });
});
