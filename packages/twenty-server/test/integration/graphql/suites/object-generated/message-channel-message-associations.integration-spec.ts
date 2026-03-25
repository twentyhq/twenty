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
                deletedAt
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
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
          const messageChannelMessageAssociations = edges[0].node;

          expect(messageChannelMessageAssociations).toHaveProperty(
            'messageExternalId',
          );
          expect(messageChannelMessageAssociations).toHaveProperty(
            'messageThreadExternalId',
          );
          expect(messageChannelMessageAssociations).toHaveProperty('direction');
          expect(messageChannelMessageAssociations).toHaveProperty('id');
          expect(messageChannelMessageAssociations).toHaveProperty('createdAt');
          expect(messageChannelMessageAssociations).toHaveProperty('updatedAt');
          expect(messageChannelMessageAssociations).toHaveProperty('deletedAt');
          expect(messageChannelMessageAssociations).toHaveProperty(
            'messageChannelId',
          );
          expect(messageChannelMessageAssociations).toHaveProperty('messageId');
        }
      });
  });
});
