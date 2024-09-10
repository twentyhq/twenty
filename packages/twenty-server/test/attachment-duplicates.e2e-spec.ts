import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('attachmentDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many attachmentDuplicates', () => {
    const queryData = {
      query: `
        query attachmentDuplicates {
          attachmentDuplicates {
            edges {
              node {
                name
                fullPath
                type
                id
                createdAt
                updatedAt
                authorId
                activityId
                taskId
                noteId
                personId
                companyId
                opportunityId
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
        const data = res.body.data.attachmentDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const attachmentduplicates = edges[0].node;

        expect(attachmentduplicates).toHaveProperty('name');
        expect(attachmentduplicates).toHaveProperty('fullPath');
        expect(attachmentduplicates).toHaveProperty('type');
        expect(attachmentduplicates).toHaveProperty('id');
        expect(attachmentduplicates).toHaveProperty('createdAt');
        expect(attachmentduplicates).toHaveProperty('updatedAt');
        expect(attachmentduplicates).toHaveProperty('authorId');
        expect(attachmentduplicates).toHaveProperty('activityId');
        expect(attachmentduplicates).toHaveProperty('taskId');
        expect(attachmentduplicates).toHaveProperty('noteId');
        expect(attachmentduplicates).toHaveProperty('personId');
        expect(attachmentduplicates).toHaveProperty('companyId');
        expect(attachmentduplicates).toHaveProperty('opportunityId');
      });
  });
});
