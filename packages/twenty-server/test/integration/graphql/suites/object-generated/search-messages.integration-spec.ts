import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchMessagesResolver (e2e)', () => {
  it('should find many searchMessages', () => {
    const queryData = {
      query: `
        query searchMessages {
          searchMessages {
            edges {
              node {
                headerMessageId
                subject
                text
                receivedAt
                id
                createdAt
                updatedAt
                deletedAt
                messageThreadId
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
        const data = res.body.data.searchMessages;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchMessages = edges[0].node;

          expect(searchMessages).toHaveProperty('headerMessageId');
          expect(searchMessages).toHaveProperty('subject');
          expect(searchMessages).toHaveProperty('text');
          expect(searchMessages).toHaveProperty('receivedAt');
          expect(searchMessages).toHaveProperty('id');
          expect(searchMessages).toHaveProperty('createdAt');
          expect(searchMessages).toHaveProperty('updatedAt');
          expect(searchMessages).toHaveProperty('deletedAt');
          expect(searchMessages).toHaveProperty('messageThreadId');
        }
      });
  });
});
