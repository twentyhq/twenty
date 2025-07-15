import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('serverlessFunctionsResolver (e2e)', () => {
  it('should find many serverlessFunctions', () => {
    const queryData = {
      query: `
        query GetManyServerlessFunctions {
          findManyServerlessFunctions {
            id
            name
            description
            runtime
            latestVersion
            publishedVersions
            createdAt
            updatedAt
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
        const serverlessFunctions = res.body.data.findManyServerlessFunctions;

        expect(serverlessFunctions).toBeDefined();
        expect(Array.isArray(serverlessFunctions)).toBe(true);

        if (serverlessFunctions.length > 0) {
          const serverlessFunction = serverlessFunctions[0];

          expect(serverlessFunction).toHaveProperty('id');
          expect(serverlessFunction).toHaveProperty('name');
          expect(serverlessFunction).toHaveProperty('description');
          expect(serverlessFunction).toHaveProperty('runtime');
          expect(serverlessFunction).toHaveProperty('latestVersion');
          expect(serverlessFunction).toHaveProperty('publishedVersions');
          expect(serverlessFunction).toHaveProperty('createdAt');
          expect(serverlessFunction).toHaveProperty('updatedAt');
        }
      });
  });
});
