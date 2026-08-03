import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type VerifyTwoFactorAuthenticationMethodDTO } from 'src/engine/core-modules/two-factor-authentication/dto/verify-two-factor-authentication-method.dto';

type VerifyTwoFactorAuthenticationMethodUtilArgs = {
  otp: string;
  accessToken: string;
  expectToFail?: boolean;
};

export const verifyTwoFactorAuthenticationMethod = async ({
  otp,
  accessToken,
  expectToFail,
}: VerifyTwoFactorAuthenticationMethodUtilArgs): CommonResponseBody<{
  verifyTwoFactorAuthenticationMethodForAuthenticatedUser: VerifyTwoFactorAuthenticationMethodDTO;
}> => {
  const mutation = gql`
    mutation VerifyTwoFactorAuthenticationMethodForAuthenticatedUser(
      $otp: String!
    ) {
      verifyTwoFactorAuthenticationMethodForAuthenticatedUser(otp: $otp) {
        success
      }
    }
  `;

  const response = await makeMetadataAPIRequest(
    {
      query: mutation,
      variables: { otp },
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'OTP verification should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'OTP verification has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
