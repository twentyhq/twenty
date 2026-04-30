import request from 'supertest';

// Tokens in URLs leak into access logs, browser history, and Referer headers.
// Authentication must only come from the Authorization header.
describe('URL ?token= query parameter is rejected as authentication', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  it('rejects ?token= on the REST API', async () => {
    await request(baseUrl)
      .post(`/rest/people?token=${API_KEY_ACCESS_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send('{}')
      .expect(403)
      .expect((res) => {
        expect(res.body.error).toBe('FORBIDDEN_EXCEPTION');
        expect(res.body.messages[0]).toBe('Missing authentication token');
      });
  });

  it('rejects ?token= on the /graphql endpoint', async () => {
    const response = await request(baseUrl)
      .post(`/graphql?token=${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ query: '{ currentUser { id } }' });

    expect(response.body?.data?.currentUser).toBeUndefined();
  });

  it('rejects ?token= on the /metadata endpoint', async () => {
    const response = await request(baseUrl)
      .post(`/metadata?token=${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ query: '{ currentUser { id } }' });

    expect(response.body?.data?.currentUser).toBeUndefined();
  });

  it('does not honor ?token= on /rest/open-api/core (returns base schema only)', async () => {
    const response = await request(baseUrl)
      .get(`/rest/open-api/core?token=${API_KEY_ACCESS_TOKEN}`)
      .expect(200);

    // If the URL token were honored, paths would include workspace objects
    // like /people. Only the documentation path means auth was rejected.
    expect(response.body.paths['/people']).toBeUndefined();
  });
});
