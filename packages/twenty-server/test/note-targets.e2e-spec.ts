import request from 'supertest';

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
              }
            }
          }
        }
      `,
    };

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
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
          const notetargets = edges[0].node;

          expect(notetargets).toHaveProperty('id');
          expect(notetargets).toHaveProperty('createdAt');
          expect(notetargets).toHaveProperty('updatedAt');
          expect(notetargets).toHaveProperty('deletedAt');
          expect(notetargets).toHaveProperty('noteId');
          expect(notetargets).toHaveProperty('personId');
          expect(notetargets).toHaveProperty('companyId');
          expect(notetargets).toHaveProperty('opportunityId');
        }
      });
  });
});
