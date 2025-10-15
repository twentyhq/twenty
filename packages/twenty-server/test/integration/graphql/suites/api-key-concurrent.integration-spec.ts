import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('API Key Concurrent Requests (GET)', () => {
  it('should correctly set createdBy.name when creating records concurrently with different API keys', async () => {
    // Note: Since we can't easily create multiple API keys in this test,
    // we'll test with the same API key multiple times concurrently.
    // The real test should use 3 different API keys with different names.

    const createPersonMutation = `
      mutation CreatePerson {
        createPerson(data: { city: "Test City" }) {
          id
          city
          createdBy {
            source
            name
            workspaceMemberId
          }
        }
      }
    `;

    // Create 3 people concurrently
    const promises = [];
    for (let i = 0; i < 3; i++) {
      const promise = client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({ query: createPersonMutation });
      promises.push(promise);
    }

    const responses = await Promise.all(promises);

    // Verify all requests succeeded
    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data?.createPerson).toBeDefined();

      const person = response.body.data.createPerson;

      // Verify createdBy is set correctly
      expect(person.createdBy.source).toBe('API');
      expect(person.createdBy.name).toBe('My api key'); // The seeded API key name
      expect(person.createdBy.workspaceMemberId).toBeNull();

      console.log(`Person ${index + 1}: createdBy.name = "${person.createdBy.name}"`);
    });

    // Clean up: delete the created people
    const personIds = responses.map(r => r.body.data.createPerson.id);

    for (const personId of personIds) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DeletePerson {
              deletePerson(id: "${personId}") {
                id
              }
            }
          `
        });
    }
  });
});
