import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarEventParticipantsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarEventParticipants', () => {
    const queryData = {
      query: `
        query calendarEventParticipants {
          calendarEventParticipants {
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
        const data = res.body.data.calendarEventParticipants;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendareventparticipants = edges[0].node;

        expect(calendareventparticipants).toHaveProperty('handle');
        expect(calendareventparticipants).toHaveProperty('displayName');
        expect(calendareventparticipants).toHaveProperty('isOrganizer');
        expect(calendareventparticipants).toHaveProperty('responseStatus');
        expect(calendareventparticipants).toHaveProperty('id');
        expect(calendareventparticipants).toHaveProperty('createdAt');
        expect(calendareventparticipants).toHaveProperty('updatedAt');
        expect(calendareventparticipants).toHaveProperty('calendarEventId');
        expect(calendareventparticipants).toHaveProperty('personId');
        expect(calendareventparticipants).toHaveProperty('workspaceMemberId');
      });
  });
});
