import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('auditLogDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many auditLogDuplicates', () => {
    const queryData = {
      query: `
        query auditLogDuplicates {
          auditLogDuplicates {
            edges {
              node {
                name
                properties
                context
                objectName
                objectMetadataId
                recordId
                id
                createdAt
                updatedAt
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
        const data = res.body.data.auditLogDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const auditlogduplicates = edges[0].node;

        expect(auditlogduplicates).toHaveProperty('name');
        expect(auditlogduplicates).toHaveProperty('properties');
        expect(auditlogduplicates).toHaveProperty('context');
        expect(auditlogduplicates).toHaveProperty('objectName');
        expect(auditlogduplicates).toHaveProperty('objectMetadataId');
        expect(auditlogduplicates).toHaveProperty('recordId');
        expect(auditlogduplicates).toHaveProperty('id');
        expect(auditlogduplicates).toHaveProperty('createdAt');
        expect(auditlogduplicates).toHaveProperty('updatedAt');
        expect(auditlogduplicates).toHaveProperty('workspaceMemberId');
      });
  });
});
