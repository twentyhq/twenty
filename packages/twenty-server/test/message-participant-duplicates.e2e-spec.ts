import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageParticipantDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageParticipantDuplicates', () => {
    const queryData = {
      query: `
        query messageParticipantDuplicates {
          messageParticipantDuplicates {
            edges {
              node {
                displayName
                role
                handle
                id
                createdAt
                updatedAt
                messageId
                personId
                workspaceMemberId
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
        const data = res.body.data.messageParticipantDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messageparticipantduplicates = edges[0].node;

        expect(messageparticipantduplicates).toHaveProperty('displayName');
        expect(messageparticipantduplicates).toHaveProperty('role');
        expect(messageparticipantduplicates).toHaveProperty('handle');
        expect(messageparticipantduplicates).toHaveProperty('id');
        expect(messageparticipantduplicates).toHaveProperty('createdAt');
        expect(messageparticipantduplicates).toHaveProperty('updatedAt');
        expect(messageparticipantduplicates).toHaveProperty('messageId');
        expect(messageparticipantduplicates).toHaveProperty('personId');
        expect(messageparticipantduplicates).toHaveProperty('workspaceMemberId');
      });
  });
});
