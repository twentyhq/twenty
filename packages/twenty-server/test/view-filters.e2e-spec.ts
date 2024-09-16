import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('viewFiltersResolver (e2e)', () => {
  it('should find many viewFilters', () => {
    const queryData = {
      query: `
        query viewFilters {
          viewFilters {
            edges {
              node {
                fieldMetadataId
                operand
                value
                displayValue
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
        const data = res.body.data.viewFilters;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const viewfilters = edges[0].node;

          expect(viewfilters).toHaveProperty('fieldMetadataId');
          expect(viewfilters).toHaveProperty('operand');
          expect(viewfilters).toHaveProperty('value');
          expect(viewfilters).toHaveProperty('displayValue');
          expect(viewfilters).toHaveProperty('id');
          expect(viewfilters).toHaveProperty('createdAt');
          expect(viewfilters).toHaveProperty('updatedAt');
          expect(viewfilters).toHaveProperty('viewId');
        }
      });
  });
});
