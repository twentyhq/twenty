import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageChannelMessageAssociationsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageChannelMessageAssociations', () => {
    const queryData = {
      query: `
        query messageChannelMessageAssociations {
          messageChannelMessageAssociations {
            edges {
              node {
                messageExternalId
                messageThreadExternalId
                direction
                id
                createdAt
                updatedAt
                messageChannelId
                messageId
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
        const data = res.body.data.messageChannelMessageAssociations;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messagechannelmessageassociations = edges[0].node;

        expect(messagechannelmessageassociations).toHaveProperty('messageExternalId');
        expect(messagechannelmessageassociations).toHaveProperty('messageThreadExternalId');
        expect(messagechannelmessageassociations).toHaveProperty('direction');
        expect(messagechannelmessageassociations).toHaveProperty('id');
        expect(messagechannelmessageassociations).toHaveProperty('createdAt');
        expect(messagechannelmessageassociations).toHaveProperty('updatedAt');
        expect(messagechannelmessageassociations).toHaveProperty('messageChannelId');
        expect(messagechannelmessageassociations).toHaveProperty('messageId');
      });
  });
});
