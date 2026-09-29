import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';

type GetAuthTokensFromTwoFactorAuthenticationRecoveryCodeUtilArgs = {
  loginToken: string;
  recoveryCode: string;
  origin: string;
  expectToFail?: boolean;
};

export const getAuthTokensFromTwoFactorAuthenticationRecoveryCode = async ({
  loginToken,
  recoveryCode,
  origin,
  expectToFail,
}: GetAuthTokensFromTwoFactorAuthenticationRecoveryCodeUtilArgs): CommonResponseBody<{
  getAuthTokensFromTwoFactorAuthenticationRecoveryCode: AuthTokens;
}> => {
  const mutation = gql`
    mutation GetAuthTokensFromTwoFactorAuthenticationRecoveryCode(
      $loginToken: String!
      $recoveryCode: String!
      $origin: String!
    ) {
      getAuthTokensFromTwoFactorAuthenticationRecoveryCode(
        loginToken: $loginToken
        recoveryCode: $recoveryCode
        origin: $origin
      ) {
        tokens {
          accessOrWorkspaceAgnosticToken {
            token
          }
        }
      }
    }
  `;

  const response = await makeMetadataApiRequest(
    { query: mutation, variables: { loginToken, recoveryCode, origin } },
    null,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Recovery code sign-in should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Recovery code sign-in has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
