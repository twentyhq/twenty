import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchNoteTargetsResolver (e2e)', () => {
  it('should find many searchNoteTargets', () => {
    const queryData = {
      query: `
        query searchNoteTargets {
          searchNoteTargets {
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
        const data = res.body.data.searchNoteTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchNoteTargets = edges[0].node;

          expect(searchNoteTargets).toHaveProperty('id');
          expect(searchNoteTargets).toHaveProperty('createdAt');
          expect(searchNoteTargets).toHaveProperty('updatedAt');
          expect(searchNoteTargets).toHaveProperty('deletedAt');
          expect(searchNoteTargets).toHaveProperty('noteId');
          expect(searchNoteTargets).toHaveProperty('personId');
          expect(searchNoteTargets).toHaveProperty('companyId');
          expect(searchNoteTargets).toHaveProperty('opportunityId');
          expect(searchNoteTargets).toHaveProperty('rocketId');
        }
      });
  });
});
