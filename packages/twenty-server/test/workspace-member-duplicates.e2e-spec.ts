import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('workspaceMemberDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many workspaceMemberDuplicates', () => {
    const queryData = {
      query: `
        query workspaceMemberDuplicates {
          workspaceMemberDuplicates {
            edges {
              node {
                id
                colorScheme
                avatarUrl
                locale
                timeZone
                dateFormat
                timeFormat
                userEmail
                userId
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
        const data = res.body.data.workspaceMemberDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const workspacememberduplicates = edges[0].node;

        expect(workspacememberduplicates).toHaveProperty('id');
        expect(workspacememberduplicates).toHaveProperty('colorScheme');
        expect(workspacememberduplicates).toHaveProperty('avatarUrl');
        expect(workspacememberduplicates).toHaveProperty('locale');
        expect(workspacememberduplicates).toHaveProperty('timeZone');
        expect(workspacememberduplicates).toHaveProperty('dateFormat');
        expect(workspacememberduplicates).toHaveProperty('timeFormat');
        expect(workspacememberduplicates).toHaveProperty('userEmail');
        expect(workspacememberduplicates).toHaveProperty('userId');
        expect(workspacememberduplicates).toHaveProperty('createdAt');
        expect(workspacememberduplicates).toHaveProperty('updatedAt');
      });
  });
});
