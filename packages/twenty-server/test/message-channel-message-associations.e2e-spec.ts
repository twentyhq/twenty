import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('messageChannelMessageAssociationsResolver (e2e)', () => {
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

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
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

        if (edges.length > 0) {
          const messagechannelmessageassociations = edges[0].node;

          expect(messagechannelmessageassociations).toHaveProperty(
            'messageExternalId',
          );
          expect(messagechannelmessageassociations).toHaveProperty(
            'messageThreadExternalId',
          );
          expect(messagechannelmessageassociations).toHaveProperty('direction');
          expect(messagechannelmessageassociations).toHaveProperty('id');
          expect(messagechannelmessageassociations).toHaveProperty('createdAt');
          expect(messagechannelmessageassociations).toHaveProperty('updatedAt');
          expect(messagechannelmessageassociations).toHaveProperty(
            'messageChannelId',
          );
          expect(messagechannelmessageassociations).toHaveProperty('messageId');
        }
      });
  });
});
