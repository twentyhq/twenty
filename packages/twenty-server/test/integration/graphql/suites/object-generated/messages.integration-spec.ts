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
          const messages = edges[0].node;

          expect(messages).toHaveProperty('id');
          expect(messages).toHaveProperty('subject');
          expect(messages).toHaveProperty('text');
          expect(messages).toHaveProperty('createdAt');
          expect(messages).toHaveProperty('updatedAt');
          expect(messages).toHaveProperty('deletedAt');
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
        const data = res.body.data.message;

        expect(data).toBeDefined();

        expect(data).toHaveProperty('id');
        expect(data.id).toBe(DEV_SEED_MESSAGE_IDS.MESSAGE_1);
        expect(data).toHaveProperty('subject');
        expect(data).toHaveProperty('text');
        expect(data).toHaveProperty('createdAt');
        expect(data).toHaveProperty('updatedAt');
        expect(data).toHaveProperty('deletedAt');
      });
  });
});
