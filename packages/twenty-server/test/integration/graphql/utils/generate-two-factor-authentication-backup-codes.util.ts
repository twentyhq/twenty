import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type TwoFactorAuthenticationBackupCodesDTO } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-backup-codes.dto';

type GenerateTwoFactorAuthenticationBackupCodesUtilArgs = {
  otp?: string;
  accessToken: string;
  expectToFail?: boolean;
};

export const generateTwoFactorAuthenticationBackupCodes = async ({
  otp,
  accessToken,
  expectToFail,
}: GenerateTwoFactorAuthenticationBackupCodesUtilArgs): CommonResponseBody<{
  generateTwoFactorAuthenticationBackupCodes: TwoFactorAuthenticationBackupCodesDTO;
}> => {
  const mutation = gql`
    mutation GenerateTwoFactorAuthenticationBackupCodes($otp: String) {
      generateTwoFactorAuthenticationBackupCodes(otp: $otp) {
        backupCodes
      }
    }
  `;

  const response = await makeMetadataApiRequest(
    { query: mutation, variables: { otp } },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Backup code generation should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Backup code generation has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
