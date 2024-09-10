import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarChannelEventAssociationsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarChannelEventAssociations', () => {
    const queryData = {
      query: `
        query calendarChannelEventAssociations {
          calendarChannelEventAssociations {
            edges {
              node {
                eventExternalId
                id
                createdAt
                updatedAt
                calendarChannelId
                calendarEventId
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
        const data = res.body.data.calendarChannelEventAssociations;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendarchanneleventassociations = edges[0].node;

        expect(calendarchanneleventassociations).toHaveProperty('eventExternalId');
        expect(calendarchanneleventassociations).toHaveProperty('id');
        expect(calendarchanneleventassociations).toHaveProperty('createdAt');
        expect(calendarchanneleventassociations).toHaveProperty('updatedAt');
        expect(calendarchanneleventassociations).toHaveProperty('calendarChannelId');
        expect(calendarchanneleventassociations).toHaveProperty('calendarEventId');
      });
  });
});
