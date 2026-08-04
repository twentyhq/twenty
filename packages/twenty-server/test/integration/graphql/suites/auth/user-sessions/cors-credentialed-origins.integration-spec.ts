import request from 'supertest';

import {
  ALLOWED_ORIGIN,
  DISALLOWED_ORIGIN,
  SEEDED_WORKSPACE_SUBDOMAIN_ORIGIN,
  UNKNOWN_WORKSPACE_SUBDOMAIN_ORIGIN,
} from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

const SERVER_URL = `http://localhost:${APP_PORT}`;

// The browser-side half of cross-origin cookie support, sibling of the CSRF
// middleware: allowlisted origins get credentialed CORS (reflected origin plus
// allow-credentials), everything else keeps the public wildcard. Runs
// unconditionally: the CORS setup does not depend on the cookie-sessions flag.
describe('credentialed CORS origins (integration)', () => {
  it('should reflect an allowlisted origin with credentials and Vary: Origin', async () => {
    const response = await request(SERVER_URL)
      .get('/client-config')
      .set('Origin', ALLOWED_ORIGIN)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      ALLOWED_ORIGIN,
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    // Without Vary: Origin a shared cache could serve the wildcard response
    // to an allowlisted origin, whose credentialed request the browser would
    // then reject.
    expect(response.headers.vary).toContain('Origin');
  });

  it('should answer a preflight for an allowlisted origin with credentials', async () => {
    const response = await request(SERVER_URL)
      .options('/metadata')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(response.status).toBeLessThan(300);
    expect(response.headers['access-control-allow-origin']).toBe(
      ALLOWED_ORIGIN,
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    // Preflights are cacheable, so this is the response a shared cache is most
    // likely to reuse across origins.
    expect(response.headers.vary).toContain('Origin');
  });

  it('should fall back to the public wildcard for a non-allowlisted origin', async () => {
    const response = await request(SERVER_URL)
      .get('/client-config')
      .set('Origin', DISALLOWED_ORIGIN)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers.vary).toContain('Origin');
  });

  it('should reflect the subdomain origin of an existing workspace with credentials', async () => {
    const response = await request(SERVER_URL)
      .get('/client-config')
      .set('Origin', SEEDED_WORKSPACE_SUBDOMAIN_ORIGIN)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe(
      SEEDED_WORKSPACE_SUBDOMAIN_ORIGIN,
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should fall back to the public wildcard for a front-domain sibling that is not a workspace', async () => {
    const response = await request(SERVER_URL)
      .get('/client-config')
      .set('Origin', UNKNOWN_WORKSPACE_SUBDOMAIN_ORIGIN)
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});
