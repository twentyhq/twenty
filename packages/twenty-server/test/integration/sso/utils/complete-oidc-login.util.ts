import request from 'supertest';

type CompleteOidcLoginArgs = {
  callbackUrl: URL;
  sessionCookie: string;
};

// The identity provider redirects to SERVER_URL, so the callback is replayed
// against the port the test app listens on.
export const completeOidcLogin = async ({
  callbackUrl,
  sessionCookie,
}: CompleteOidcLoginArgs) => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .get(`${callbackUrl.pathname}${callbackUrl.search}`)
    .set('Cookie', sessionCookie);

  if (response.status !== 302) {
    throw new Error(
      `Expected the OIDC callback to redirect to the front, got ${response.status}`,
    );
  }

  return new URL(response.headers.location);
};
