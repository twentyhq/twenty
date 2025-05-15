import request from 'supertest';

import { DEV_SEED_MESSAGE_IDS } from 'src/database/typeorm-seeds/workspace/messages';

const client = request(`http://localhost:${APP_PORT}`);

describe('messagesResolver (e2e)', () => {
  it('should find many messages', async () => {
    const queryData = {
      query: `
        query messages {
          messages {
            edges {
              node {
                id
                subject
                text
                createdAt
                updatedAt
                deletedAt
              }
            }
          }
        }
      `,
    };

    return await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
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
          const message = edges[0].node;

          expect(message).toHaveProperty('id');
          expect(message).toHaveProperty('subject');
          expect(message).toHaveProperty('text');
          expect(message).toHaveProperty('createdAt');
          expect(message).toHaveProperty('updatedAt');
          expect(message).toHaveProperty('deletedAt');
        }
      });
  });

  it('should find one message', async () => {
    const queryData = {
      query: `
        query message($id: ID!) {
          message(filter: { id: { eq: $id } }) {
                id
                subject
                text
                createdAt
                updatedAt
                deletedAt
            }
        }
      `,
      variables: {
        id: DEV_SEED_MESSAGE_IDS.MESSAGE_1,
      },
    };

    return await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const message = res.body.data.message;

        expect(message).toBeDefined();

        expect(message).toHaveProperty('id');
        expect(message.id).toBe(DEV_SEED_MESSAGE_IDS.MESSAGE_1);
        expect(message).toHaveProperty('subject');
        expect(message).toHaveProperty('text');
        expect(message).toHaveProperty('createdAt');
        expect(message).toHaveProperty('updatedAt');
        expect(message).toHaveProperty('deletedAt');
      });
  });
});
