import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageDuplicates', () => {
    const queryData = {
      query: `
        query messageDuplicates {
          messageDuplicates {
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
        const data = res.body.data.messageDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messageduplicates = edges[0].node;

        expect(messageduplicates).toHaveProperty('headerMessageId');
        expect(messageduplicates).toHaveProperty('subject');
        expect(messageduplicates).toHaveProperty('text');
        expect(messageduplicates).toHaveProperty('receivedAt');
        expect(messageduplicates).toHaveProperty('id');
        expect(messageduplicates).toHaveProperty('createdAt');
        expect(messageduplicates).toHaveProperty('updatedAt');
        expect(messageduplicates).toHaveProperty('messageThreadId');
      });
  });
});
