import request from 'supertest';

describe('messagesResolver (e2e)', () => {
  it('should find many messages', () => {
    const queryData = {
      query: `
        query messages {
          messages {
            edges {
              node {
                headerMessageId
                subject
                text
                receivedAt
                id
                createdAt
                updatedAt
                messageThreadId
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
          expect(messages).toHaveProperty('messageThreadId');
        }
      });
  });
});
