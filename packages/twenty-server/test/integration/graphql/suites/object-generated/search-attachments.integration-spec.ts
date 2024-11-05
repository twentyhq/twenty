import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchAttachmentsResolver (e2e)', () => {
  it('should find many searchAttachments', () => {
    const queryData = {
      query: `
        query searchAttachments {
          searchAttachments {
            edges {
              node {
                name
                fullPath
                type
                id
                createdAt
                updatedAt
                deletedAt
                authorId
                taskId
                noteId
                personId
                companyId
                opportunityId
                rocketId
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
        const data = res.body.data.searchAttachments;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchAttachments = edges[0].node;

          expect(searchAttachments).toHaveProperty('name');
          expect(searchAttachments).toHaveProperty('fullPath');
          expect(searchAttachments).toHaveProperty('type');
          expect(searchAttachments).toHaveProperty('id');
          expect(searchAttachments).toHaveProperty('createdAt');
          expect(searchAttachments).toHaveProperty('updatedAt');
          expect(searchAttachments).toHaveProperty('deletedAt');
          expect(searchAttachments).toHaveProperty('authorId');
          expect(searchAttachments).toHaveProperty('taskId');
          expect(searchAttachments).toHaveProperty('noteId');
          expect(searchAttachments).toHaveProperty('personId');
          expect(searchAttachments).toHaveProperty('companyId');
          expect(searchAttachments).toHaveProperty('opportunityId');
          expect(searchAttachments).toHaveProperty('rocketId');
        }
      });
  });
});
