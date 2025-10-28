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
      .set(
        'Authorization',
        `Bearer ${APPLE_SARAH_IMPERSONATE_TIM_INVALID_ACCESS_TOKEN}`,
      )
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain(
          'Impersonation not allowed',
        );
      });
  });
});
