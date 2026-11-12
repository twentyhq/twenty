import { isString } from '@sniptt/guards';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

type ExpectSsoErrorRedirectArgs = {
  redirectUrl: URL;
  workspaceSubdomain: string;
  errorMessage: string | RegExp;
};

export const expectSsoErrorRedirect = ({
  redirectUrl,
  workspaceSubdomain,
  errorMessage,
}: ExpectSsoErrorRedirectArgs) => {
  const frontendUrl = process.env.FRONTEND_URL;

  assertIsDefinedOrThrow(frontendUrl);

  const frontUrl = new URL(frontendUrl);

  expect({
    origin: redirectUrl.origin,
    pathname: redirectUrl.pathname,
    loginToken: redirectUrl.searchParams.get('loginToken'),
    errorMessage: redirectUrl.searchParams.get('errorMessage'),
  }).toEqual({
    origin: `${frontUrl.protocol}//${workspaceSubdomain}.${frontUrl.host}`,
    pathname: '/verify',
    loginToken: null,
    errorMessage: isString(errorMessage)
      ? errorMessage
      : expect.stringMatching(errorMessage),
  });
};
