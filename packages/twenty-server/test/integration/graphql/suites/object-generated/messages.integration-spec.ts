import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('messagesResolver (e2e)', () => {
  it('should find many messages', () => {
    const queryData = {
      query: `
        query messages($filter: MessageFilterInput) {
          messages(filter: $filter) {
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
      variables: {
        filter: {
          id: 'b1305b29-f5d6-4388-b7f6-2c136d543563',
        },
      },
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
        const data = res.body.data.messages;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const messages = edges[0].node;

          expect(messages).toHaveProperty('headerMessageId');
          expect(messages).toHaveProperty('subject');
          expect(messages).toHaveProperty('text');
          expect(messages).toHaveProperty('receivedAt');
          expect(messages).toHaveProperty('id');
          expect(messages).toHaveProperty('createdAt');
          expect(messages).toHaveProperty('updatedAt');
          expect(messages).toHaveProperty('deletedAt');
          expect(messages).toHaveProperty('messageThreadId');
        }
      });
  });
});
