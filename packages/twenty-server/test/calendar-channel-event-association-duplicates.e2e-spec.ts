import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarChannelEventAssociationDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarChannelEventAssociationDuplicates', () => {
    const queryData = {
      query: `
        query calendarChannelEventAssociationDuplicates {
          calendarChannelEventAssociationDuplicates {
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
        const data = res.body.data.calendarChannelEventAssociationDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendarchanneleventassociationduplicates = edges[0].node;

        expect(calendarchanneleventassociationduplicates).toHaveProperty('eventExternalId');
        expect(calendarchanneleventassociationduplicates).toHaveProperty('id');
        expect(calendarchanneleventassociationduplicates).toHaveProperty('createdAt');
        expect(calendarchanneleventassociationduplicates).toHaveProperty('updatedAt');
        expect(calendarchanneleventassociationduplicates).toHaveProperty('calendarChannelId');
        expect(calendarchanneleventassociationduplicates).toHaveProperty('calendarEventId');
      });
  });
});
