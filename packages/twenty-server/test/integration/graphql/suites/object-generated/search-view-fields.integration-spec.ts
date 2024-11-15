import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchViewFieldsResolver (e2e)', () => {
  it('should find many searchViewFields', () => {
    const queryData = {
      query: `
        query searchViewFields {
          searchViewFields {
            edges {
              node {
                fieldMetadataId
                isVisible
                size
                position
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
        const data = res.body.data.searchViewFields;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchViewFields = edges[0].node;

          expect(searchViewFields).toHaveProperty('fieldMetadataId');
          expect(searchViewFields).toHaveProperty('isVisible');
          expect(searchViewFields).toHaveProperty('size');
          expect(searchViewFields).toHaveProperty('position');
          expect(searchViewFields).toHaveProperty('id');
          expect(searchViewFields).toHaveProperty('createdAt');
          expect(searchViewFields).toHaveProperty('updatedAt');
          expect(searchViewFields).toHaveProperty('deletedAt');
          expect(searchViewFields).toHaveProperty('viewId');
        }
      });
  });
});
