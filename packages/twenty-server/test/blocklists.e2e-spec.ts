import request from 'supertest';

describe('blocklistsResolver (e2e)', () => {
  it('should find many blocklists', () => {
    const queryData = {
      query: `
        query blocklists {
          blocklists {
            edges {
              node {
                handle
                id
                createdAt
                updatedAt
                workspaceMemberId
              }
            }
          }
        }
      `,
    };

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.blocklists;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const blocklists = edges[0].node;

          expect(blocklists).toHaveProperty('handle');
          expect(blocklists).toHaveProperty('id');
          expect(blocklists).toHaveProperty('createdAt');
          expect(blocklists).toHaveProperty('updatedAt');
          expect(blocklists).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
