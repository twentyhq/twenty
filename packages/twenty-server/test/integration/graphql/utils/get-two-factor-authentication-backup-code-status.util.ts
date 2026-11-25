import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type TwoFactorAuthenticationBackupCodeStatusDTO } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-backup-code-status.dto';

type GetTwoFactorAuthenticationBackupCodeStatusUtilArgs = {
  accessToken: string;
  expectToFail?: boolean;
};

export const getTwoFactorAuthenticationBackupCodeStatus = async ({
  accessToken,
  expectToFail,
}: GetTwoFactorAuthenticationBackupCodeStatusUtilArgs): CommonResponseBody<{
  twoFactorAuthenticationBackupCodeStatus: TwoFactorAuthenticationBackupCodeStatusDTO;
}> => {
  const query = gql`
    query TwoFactorAuthenticationBackupCodeStatus {
      twoFactorAuthenticationBackupCodeStatus {
        remainingBackupCodeCount
      }
    }
  `;

  const response = await makeMetadataApiRequest({ query }, accessToken);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Backup code status should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Backup code status has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
