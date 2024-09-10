import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('timelineActivityDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many timelineActivityDuplicates', () => {
    const queryData = {
      query: `
        query timelineActivityDuplicates {
          timelineActivityDuplicates {
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
        const data = res.body.data.timelineActivityDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const timelineactivityduplicates = edges[0].node;

        expect(timelineactivityduplicates).toHaveProperty('happensAt');
        expect(timelineactivityduplicates).toHaveProperty('name');
        expect(timelineactivityduplicates).toHaveProperty('properties');
        expect(timelineactivityduplicates).toHaveProperty('linkedRecordCachedName');
        expect(timelineactivityduplicates).toHaveProperty('linkedRecordId');
        expect(timelineactivityduplicates).toHaveProperty('linkedObjectMetadataId');
        expect(timelineactivityduplicates).toHaveProperty('id');
        expect(timelineactivityduplicates).toHaveProperty('createdAt');
        expect(timelineactivityduplicates).toHaveProperty('updatedAt');
        expect(timelineactivityduplicates).toHaveProperty('workspaceMemberId');
        expect(timelineactivityduplicates).toHaveProperty('personId');
        expect(timelineactivityduplicates).toHaveProperty('companyId');
        expect(timelineactivityduplicates).toHaveProperty('opportunityId');
        expect(timelineactivityduplicates).toHaveProperty('noteId');
        expect(timelineactivityduplicates).toHaveProperty('taskId');
      });
  });
});
