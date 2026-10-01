import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type AuthTokens } from 'src/engine/core-modules/auth/dto/auth-tokens.dto';

type GetAuthTokensFromOtpUtilArgs = {
  loginToken: string;
  otp: string;
  origin: string;
  expectToFail?: boolean;
};

export const getAuthTokensFromOtp = async ({
  loginToken,
  otp,
  origin,
  expectToFail,
}: GetAuthTokensFromOtpUtilArgs): CommonResponseBody<{
  getAuthTokensFromOTP: AuthTokens;
}> => {
  const mutation = gql`
    mutation GetAuthTokensFromOTP(
      $loginToken: String!
      $otp: String!
      $origin: String!
    ) {
      getAuthTokensFromOTP(
        loginToken: $loginToken
        otp: $otp
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
    { query: mutation, variables: { loginToken, otp, origin } },
    null,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'OTP token exchange should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'OTP token exchange has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
