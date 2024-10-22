import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchViewFiltersResolver (e2e)', () => {
  it('should find many searchViewFilters', () => {
    const queryData = {
      query: `
        query searchViewFilters {
          searchViewFilters {
            edges {
              node {
                fieldMetadataId
                operand
                value
                displayValue
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
        const data = res.body.data.searchViewFilters;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchViewFilters = edges[0].node;

          expect(searchViewFilters).toHaveProperty('fieldMetadataId');
          expect(searchViewFilters).toHaveProperty('operand');
          expect(searchViewFilters).toHaveProperty('value');
          expect(searchViewFilters).toHaveProperty('displayValue');
          expect(searchViewFilters).toHaveProperty('id');
          expect(searchViewFilters).toHaveProperty('createdAt');
          expect(searchViewFilters).toHaveProperty('updatedAt');
          expect(searchViewFilters).toHaveProperty('deletedAt');
          expect(searchViewFilters).toHaveProperty('viewId');
        }
      });
  });
});
