import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('timelineActivitiesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many timelineActivities', () => {
    const queryData = {
      query: `
        query timelineActivities {
          timelineActivities {
            edges {
              node {
                happensAt
                name
                properties
                linkedRecordCachedName
                linkedRecordId
                linkedObjectMetadataId
                id
                createdAt
                updatedAt
                workspaceMemberId
                personId
                companyId
                opportunityId
                noteId
                taskId
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
        const data = res.body.data.timelineActivities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const timelineactivities = edges[0].node;

        expect(timelineactivities).toHaveProperty('happensAt');
        expect(timelineactivities).toHaveProperty('name');
        expect(timelineactivities).toHaveProperty('properties');
        expect(timelineactivities).toHaveProperty('linkedRecordCachedName');
        expect(timelineactivities).toHaveProperty('linkedRecordId');
        expect(timelineactivities).toHaveProperty('linkedObjectMetadataId');
        expect(timelineactivities).toHaveProperty('id');
        expect(timelineactivities).toHaveProperty('createdAt');
        expect(timelineactivities).toHaveProperty('updatedAt');
        expect(timelineactivities).toHaveProperty('workspaceMemberId');
        expect(timelineactivities).toHaveProperty('personId');
        expect(timelineactivities).toHaveProperty('companyId');
        expect(timelineactivities).toHaveProperty('opportunityId');
        expect(timelineactivities).toHaveProperty('noteId');
        expect(timelineactivities).toHaveProperty('taskId');
      });
  });
});
