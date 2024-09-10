import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarEventDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarEventDuplicates', () => {
    const queryData = {
      query: `
        query calendarEventDuplicates {
          calendarEventDuplicates {
            edges {
              node {
                title
                isCanceled
                isFullDay
                startsAt
                endsAt
                externalCreatedAt
                externalUpdatedAt
                description
                location
                iCalUID
                conferenceSolution
                recurringEventExternalId
                id
                createdAt
                updatedAt
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
        const data = res.body.data.calendarEventDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendareventduplicates = edges[0].node;

        expect(calendareventduplicates).toHaveProperty('title');
        expect(calendareventduplicates).toHaveProperty('isCanceled');
        expect(calendareventduplicates).toHaveProperty('isFullDay');
        expect(calendareventduplicates).toHaveProperty('startsAt');
        expect(calendareventduplicates).toHaveProperty('endsAt');
        expect(calendareventduplicates).toHaveProperty('externalCreatedAt');
        expect(calendareventduplicates).toHaveProperty('externalUpdatedAt');
        expect(calendareventduplicates).toHaveProperty('description');
        expect(calendareventduplicates).toHaveProperty('location');
        expect(calendareventduplicates).toHaveProperty('iCalUID');
        expect(calendareventduplicates).toHaveProperty('conferenceSolution');
        expect(calendareventduplicates).toHaveProperty('recurringEventExternalId');
        expect(calendareventduplicates).toHaveProperty('id');
        expect(calendareventduplicates).toHaveProperty('createdAt');
        expect(calendareventduplicates).toHaveProperty('updatedAt');
      });
  });
});
