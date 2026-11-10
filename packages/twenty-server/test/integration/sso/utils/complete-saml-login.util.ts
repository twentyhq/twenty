import { replayOnTestApp } from 'test/integration/sso/utils/replay-on-test-app.util';
import { isDefined } from 'twenty-shared/utils';

type CompleteSamlLoginArgs = {
  callbackUrl: URL;
  samlResponse: string;
  relayState?: string;
};

export const completeSamlLogin = async ({
  callbackUrl,
  samlResponse,
  relayState,
}: CompleteSamlLoginArgs) => {
  const response = await replayOnTestApp(callbackUrl, {
    form: {
      SAMLResponse: samlResponse,
      ...(isDefined(relayState) ? { RelayState: relayState } : {}),
    },
  });

  if (response.status !== 302) {
    throw new Error(
      `Expected the SAML callback to redirect to the front, got ${response.status}`,
    );
  }

  return new URL(response.headers.location);
};
