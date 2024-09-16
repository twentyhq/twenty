import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('viewFieldsResolver (e2e)', () => {
  it('should find many viewFields', () => {
    const queryData = {
      query: `
        query viewFields {
          viewFields {
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
        const data = res.body.data.viewFields;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const viewFields = edges[0].node;

          expect(viewFields).toHaveProperty('fieldMetadataId');
          expect(viewFields).toHaveProperty('isVisible');
          expect(viewFields).toHaveProperty('size');
          expect(viewFields).toHaveProperty('position');
          expect(viewFields).toHaveProperty('id');
          expect(viewFields).toHaveProperty('createdAt');
          expect(viewFields).toHaveProperty('updatedAt');
          expect(viewFields).toHaveProperty('deletedAt');
          expect(viewFields).toHaveProperty('viewId');
        }
      });
  });
});
