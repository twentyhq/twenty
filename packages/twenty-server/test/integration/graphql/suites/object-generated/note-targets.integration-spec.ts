import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('noteTargetsResolver (e2e)', () => {
  it('should find many noteTargets', () => {
    const queryData = {
      query: `
        query noteTargets {
          noteTargets {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
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
        const data = res.body.data.noteTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const noteTargets = edges[0].node;

          expect(noteTargets).toHaveProperty('id');
          expect(noteTargets).toHaveProperty('createdAt');
          expect(noteTargets).toHaveProperty('updatedAt');
          expect(noteTargets).toHaveProperty('deletedAt');
          expect(noteTargets).toHaveProperty('noteId');
          expect(noteTargets).toHaveProperty('personId');
          expect(noteTargets).toHaveProperty('companyId');
          expect(noteTargets).toHaveProperty('opportunityId');
          expect(noteTargets).toHaveProperty('petId');
          expect(noteTargets).toHaveProperty('surveyResultId');
        }
      });
  });
});
