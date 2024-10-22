import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchMessageChannelMessageAssociationsResolver (e2e)', () => {
  it('should find many searchMessageChannelMessageAssociations', () => {
    const queryData = {
      query: `
        query searchMessageChannelMessageAssociations {
          searchMessageChannelMessageAssociations {
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
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.searchMessageChannelMessageAssociations;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchMessageChannelMessageAssociations = edges[0].node;

          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'messageExternalId',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'messageThreadExternalId',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'direction',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty('id');
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'createdAt',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'updatedAt',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'deletedAt',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'messageChannelId',
          );
          expect(searchMessageChannelMessageAssociations).toHaveProperty(
            'messageId',
          );
        }
      });
  });
});
