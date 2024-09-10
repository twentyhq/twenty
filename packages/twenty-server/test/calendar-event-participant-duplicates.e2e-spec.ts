import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarEventParticipantDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarEventParticipantDuplicates', () => {
    const queryData = {
      query: `
        query calendarEventParticipantDuplicates {
          calendarEventParticipantDuplicates {
            edges {
              node {
                handle
                displayName
                isOrganizer
                responseStatus
                id
                createdAt
                updatedAt
                calendarEventId
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
        const data = res.body.data.calendarEventParticipantDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendareventparticipantduplicates = edges[0].node;

        expect(calendareventparticipantduplicates).toHaveProperty('handle');
        expect(calendareventparticipantduplicates).toHaveProperty('displayName');
        expect(calendareventparticipantduplicates).toHaveProperty('isOrganizer');
        expect(calendareventparticipantduplicates).toHaveProperty('responseStatus');
        expect(calendareventparticipantduplicates).toHaveProperty('id');
        expect(calendareventparticipantduplicates).toHaveProperty('createdAt');
        expect(calendareventparticipantduplicates).toHaveProperty('updatedAt');
        expect(calendareventparticipantduplicates).toHaveProperty('calendarEventId');
        expect(calendareventparticipantduplicates).toHaveProperty('personId');
        expect(calendareventparticipantduplicates).toHaveProperty('workspaceMemberId');
      });
  });
});
