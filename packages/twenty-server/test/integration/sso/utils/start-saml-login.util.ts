import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';

export const startSamlLogin = async (loginUrl: URL) => {
  const response = await replayOnTestApp(loginUrl);

  if (response.status !== 302) {
    throw new Error(
      `Expected a redirect to the identity provider, got ${response.status}`,
    );
  }

  return new URL(response.headers.location);
};
