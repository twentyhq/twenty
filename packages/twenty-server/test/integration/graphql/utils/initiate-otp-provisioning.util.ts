import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type InitiateTwoFactorAuthenticationProvisioningDTO } from 'src/engine/core-modules/two-factor-authentication/dto/initiate-two-factor-authentication-provisioning.dto';

type InitiateOtpProvisioningUtilArgs = {
  loginToken: string;
  origin: string;
  expectToFail?: boolean;
};

export const initiateOtpProvisioning = async ({
  loginToken,
  origin,
  expectToFail,
}: InitiateOtpProvisioningUtilArgs): CommonResponseBody<{
  initiateOTPProvisioning: InitiateTwoFactorAuthenticationProvisioningDTO;
}> => {
  const mutation = gql`
    mutation InitiateOTPProvisioning($loginToken: String!, $origin: String!) {
      initiateOTPProvisioning(loginToken: $loginToken, origin: $origin) {
        uri
      }
    }
  `;

  const response = await makeMetadataApiRequest(
    { query: mutation, variables: { loginToken, origin } },
    null,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'OTP provisioning should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'OTP provisioning has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
