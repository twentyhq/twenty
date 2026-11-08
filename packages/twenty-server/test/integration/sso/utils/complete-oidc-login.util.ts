import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';

type CompleteOidcLoginArgs = {
  callbackUrl: URL;
  sessionCookie: string;
};

export const completeOidcLogin = async ({
  callbackUrl,
  sessionCookie,
}: CompleteOidcLoginArgs) => {
  const response = await replayOnTestApp(callbackUrl).set(
    'Cookie',
    sessionCookie,
  );

  if (response.status !== 302) {
    throw new Error(
      `Expected the OIDC callback to redirect to the front, got ${response.status}`,
    );
  }

  return new URL(response.headers.location);
};
