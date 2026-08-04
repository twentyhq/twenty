import request from 'supertest';

const SERVER_URL = `http://localhost:${APP_PORT}`;

// Every workspace lives on a subdomain of FRONTEND_URL when multi-workspace is
// enabled (WorkspaceDomainsService.getTwentyWorkspaceUrl), so those, not the
// bare FRONTEND_URL, are the origins a browser actually sends. Subdomains are
// minted at runtime, so AUTH_COOKIE_ALLOWED_ORIGINS cannot enumerate them.
// .env.test enables multi-workspace.
const buildFrontendOrigin = (hostnamePrefix = ''): string => {
  const frontendUrl = new URL(
    process.env.FRONTEND_URL ?? 'http://localhost:3001',
  );

  frontendUrl.hostname = `${hostnamePrefix}${frontendUrl.hostname}`;

  return frontendUrl.origin;
};

const getCorsHeadersForOrigin = async (origin: string) => {
  const response = await request(SERVER_URL)
    .get('/client-config')
    .set('Origin', origin)
    .expect(200);

  return {
    allowOrigin: response.headers['access-control-allow-origin'],
    allowCredentials: response.headers['access-control-allow-credentials'],
  };
};

describe('workspace subdomain CORS (integration)', () => {
  it.each([['app.'], ['acme.']])(
    'should give the %s workspace subdomain a credentialed CORS response',
    async (hostnamePrefix) => {
      const origin = buildFrontendOrigin(hostnamePrefix);

      const { allowOrigin, allowCredentials } =
        await getCorsHeadersForOrigin(origin);

      expect(allowOrigin).toBe(origin);
      expect(allowCredentials).toBe('true');
    },
  );

  it('should not credential a host that merely ends with the front domain string', async () => {
    const origin = buildFrontendOrigin('evil');

    const { allowOrigin } = await getCorsHeadersForOrigin(origin);

    expect(allowOrigin).toBe('*');
  });

  it('should not credential a workspace subdomain on another port', async () => {
    const frontendUrl = new URL(buildFrontendOrigin('acme.'));

    frontendUrl.port = '9999';

    const { allowOrigin } = await getCorsHeadersForOrigin(frontendUrl.origin);

    expect(allowOrigin).toBe('*');
  });

  it('should not credential a workspace subdomain on another scheme', async () => {
    const frontendUrl = new URL(buildFrontendOrigin('acme.'));

    frontendUrl.protocol = 'https:';

    const { allowOrigin } = await getCorsHeadersForOrigin(frontendUrl.origin);

    expect(allowOrigin).toBe('*');
  });
});
