import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('attachmentsResolver (e2e)', () => {
  it('should find many attachments', () => {
    const queryData = {
      query: `
        query attachments {
          attachments {
            edges {
              node {
                name
                fullPath
                id
                createdAt
                updatedAt
                deletedAt
                taskId
                noteId
                personId
                companyId
                opportunityId
                petId
                surveyResultId
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
        const data = res.body.data.attachments;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const attachments = edges[0].node;

          expect(attachments).toHaveProperty('name');
          expect(attachments).toHaveProperty('fullPath');
          expect(attachments).toHaveProperty('id');
          expect(attachments).toHaveProperty('createdAt');
          expect(attachments).toHaveProperty('updatedAt');
          expect(attachments).toHaveProperty('deletedAt');
          expect(attachments).toHaveProperty('taskId');
          expect(attachments).toHaveProperty('noteId');
          expect(attachments).toHaveProperty('personId');
          expect(attachments).toHaveProperty('companyId');
          expect(attachments).toHaveProperty('opportunityId');
          expect(attachments).toHaveProperty('petId');
          expect(attachments).toHaveProperty('surveyResultId');
        }
      });
  });
});
