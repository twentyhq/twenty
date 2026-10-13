import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type TwoFactorAuthenticationRecoveryCodeDTO } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-recovery-code.dto';

type GenerateTwoFactorAuthenticationRecoveryCodeUtilArgs = {
  userId: string;
  otp?: string;
  accessToken: string;
  expectToFail?: boolean;
};

export const generateTwoFactorAuthenticationRecoveryCode = async ({
  userId,
  otp,
  accessToken,
  expectToFail,
}: GenerateTwoFactorAuthenticationRecoveryCodeUtilArgs): CommonResponseBody<{
  generateTwoFactorAuthenticationRecoveryCode: TwoFactorAuthenticationRecoveryCodeDTO;
}> => {
  const mutation = gql`
    mutation GenerateTwoFactorAuthenticationRecoveryCode(
      $userId: UUID!
      $otp: String
    ) {
      generateTwoFactorAuthenticationRecoveryCode(userId: $userId, otp: $otp) {
        recoveryCode
        expiresAt
      }
    }
  `;

  const response = await makeMetadataApiRequest(
    { query: mutation, variables: { userId, otp } },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Recovery code generation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Recovery code generation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
