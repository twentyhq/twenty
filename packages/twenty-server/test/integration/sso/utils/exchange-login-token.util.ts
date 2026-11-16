import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { isDefined } from 'twenty-shared/utils';

export const exchangeLoginToken = async (verifyUrl: URL) => {
  const loginToken = verifyUrl.searchParams.get('loginToken');

  if (!isDefined(loginToken)) {
    return undefined;
  }

  const { data } = await getAuthTokensFromLoginToken({
    loginToken,
    origin: verifyUrl.origin,
    expectToFail: false,
  });

  return data.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
    .token;
};
