import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchPeopleResolver (e2e)', () => {
  it('should find many searchPeople', () => {
    const queryData = {
      query: `
        query searchPeople {
          searchPeople {
            edges {
              node {
                jobTitle
                city
                avatarUrl
                position
                searchVector
                id
                createdAt
                updatedAt
                deletedAt
                companyId
                intro
                workPreference
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
        const data = res.body.data.searchPeople;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchPeople = edges[0].node;

          expect(searchPeople).toHaveProperty('jobTitle');
          expect(searchPeople).toHaveProperty('city');
          expect(searchPeople).toHaveProperty('avatarUrl');
          expect(searchPeople).toHaveProperty('position');
          expect(searchPeople).toHaveProperty('searchVector');
          expect(searchPeople).toHaveProperty('id');
          expect(searchPeople).toHaveProperty('createdAt');
          expect(searchPeople).toHaveProperty('updatedAt');
          expect(searchPeople).toHaveProperty('deletedAt');
          expect(searchPeople).toHaveProperty('companyId');
          expect(searchPeople).toHaveProperty('intro');
          expect(searchPeople).toHaveProperty('workPreference');
          expect(searchPeople).toHaveProperty('performanceRating');
        }
      });
  });
});
