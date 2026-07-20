import gql from 'graphql-tag';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';

type GetAuthTokensFromSsoExchangeTokenUtilArgs = {
  ssoExchangeToken: string;
  expectToFail?: boolean;
};

export const getAuthTokensFromSsoExchangeToken = async ({
  ssoExchangeToken,
  expectToFail,
}: GetAuthTokensFromSsoExchangeTokenUtilArgs): CommonResponseBody<{
  getAuthTokensFromSsoExchangeToken: AuthTokens;
}> => {
  const mutation = gql`
    mutation GetAuthTokensFromSsoExchangeToken($ssoExchangeToken: String!) {
      getAuthTokensFromSsoExchangeToken(ssoExchangeToken: $ssoExchangeToken) {
        tokens {
          accessOrWorkspaceAgnosticToken {
            token
            expiresAt
          }
          refreshToken {
            token
            expiresAt
          }
        }
      }
    }
  `;

  const response = await makeMetadataAPIRequest(
    {
      query: mutation,
      variables: { ssoExchangeToken },
    },
    undefined, // Public endpoint - no authentication required
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Get auth tokens from sso exchange token should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Get auth tokens from sso exchange token has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
