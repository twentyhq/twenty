import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { type UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

// The headers a browser signed in as the transient token's user sends when it navigates to /auth/apps/authorize.
export const buildSignedInBrowserHeaders = async ({
  transientToken,
  flowCookie,
}: {
  transientToken: string;
  flowCookie?: string;
}): Promise<Record<string, string>> => {
  const { userId } = await getAppProviderByClassName<TransientTokenService>(
    'TransientTokenService',
  ).verifyTransientToken(transientToken);
  const { sessionToken } = await getAppProviderByClassName<UserSessionService>(
    'UserSessionService',
  ).createSession({
    userId,
    authProvider: AuthProviderEnum.Password,
    origin: 'sign_in',
  });

  return {
    Cookie: [`${USER_SESSION_COOKIE_NAME}=${sessionToken}`, flowCookie]
      .filter(isDefined)
      .join('; '),
    'Sec-Fetch-Mode': 'navigate',
  };
};
