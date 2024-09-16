import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('peopleResolver (e2e)', () => {
  it('should find many people', () => {
    const queryData = {
      query: `
        query people {
          people {
            edges {
              node {
                jobTitle
                phone
                city
                avatarUrl
                position
                id
                createdAt
                updatedAt
                companyId
                intro
                whatsapp
                workPrefereance
                performanceRating
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
        const data = res.body.data.people;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const people = edges[0].node;

          expect(people).toHaveProperty('jobTitle');
          expect(people).toHaveProperty('phone');
          expect(people).toHaveProperty('city');
          expect(people).toHaveProperty('avatarUrl');
          expect(people).toHaveProperty('position');
          expect(people).toHaveProperty('id');
          expect(people).toHaveProperty('createdAt');
          expect(people).toHaveProperty('updatedAt');
          expect(people).toHaveProperty('companyId');
          expect(people).toHaveProperty('intro');
          expect(people).toHaveProperty('whatsapp');
          expect(people).toHaveProperty('workPrefereance');
          expect(people).toHaveProperty('performanceRating');
        }
      });
  });
});
