import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('blocklistsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many blocklists', () => {
    const queryData = {
      query: `
        query blocklists {
          blocklists {
            edges {
              node {
                handle
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
        const data = res.body.data.blocklists;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const blocklists = edges[0].node;

        expect(blocklists).toHaveProperty('handle');
        expect(blocklists).toHaveProperty('id');
        expect(blocklists).toHaveProperty('createdAt');
        expect(blocklists).toHaveProperty('updatedAt');
        expect(blocklists).toHaveProperty('workspaceMemberId');
      });
  });
});
