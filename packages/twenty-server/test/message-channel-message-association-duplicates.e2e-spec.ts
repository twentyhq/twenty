import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageChannelMessageAssociationDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageChannelMessageAssociationDuplicates', () => {
    const queryData = {
      query: `
        query messageChannelMessageAssociationDuplicates {
          messageChannelMessageAssociationDuplicates {
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
        const data = res.body.data.messageChannelMessageAssociationDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messagechannelmessageassociationduplicates = edges[0].node;

        expect(messagechannelmessageassociationduplicates).toHaveProperty('messageExternalId');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('messageThreadExternalId');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('direction');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('id');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('createdAt');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('updatedAt');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('messageChannelId');
        expect(messagechannelmessageassociationduplicates).toHaveProperty('messageId');
      });
  });
});
