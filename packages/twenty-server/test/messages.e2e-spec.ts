import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messagesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

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

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
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

        expect(edges.length).toBeGreaterThan(0);

        const messages = edges[0].node;

        expect(messages).toHaveProperty('headerMessageId');
        expect(messages).toHaveProperty('subject');
        expect(messages).toHaveProperty('text');
        expect(messages).toHaveProperty('receivedAt');
        expect(messages).toHaveProperty('id');
        expect(messages).toHaveProperty('createdAt');
        expect(messages).toHaveProperty('updatedAt');
        expect(messages).toHaveProperty('messageThreadId');
      });
  });
});
