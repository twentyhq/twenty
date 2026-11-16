import { generateTwoFactorAuthenticationOtp } from 'test/integration/graphql/utils/generate-two-factor-authentication-otp.util';
import { initiateOtpProvisioningForAuthenticatedUser } from 'test/integration/graphql/utils/initiate-otp-provisioning-for-authenticated-user.util';
import { verifyTwoFactorAuthenticationMethod } from 'test/integration/graphql/utils/verify-two-factor-authentication-method.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

type EnrollTwoFactorAuthenticationAuthenticatorUtilArgs = {
  accessToken: string;
};

export const enrollTwoFactorAuthenticationAuthenticator = async ({
  accessToken,
}: EnrollTwoFactorAuthenticationAuthenticatorUtilArgs): Promise<{
  provisioningUri: string;
  backupCodes: string[];
}> => {
  const { data: provisioningData } =
    await initiateOtpProvisioningForAuthenticatedUser({
      accessToken,
      expectToFail: false,
    });

  const provisioningUri =
    provisioningData.initiateOTPProvisioningForAuthenticatedUser.uri;

  const { data: verificationData } = await verifyTwoFactorAuthenticationMethod({
    otp: await generateTwoFactorAuthenticationOtp({
      provisioningUri,
      timeStep: 'previous',
    }),
    accessToken,
    expectToFail: false,
  });

  const backupCodes =
    verificationData.verifyTwoFactorAuthenticationMethodForAuthenticatedUser
      .backupCodes;

  assertIsDefinedOrThrow(backupCodes);

  return { provisioningUri, backupCodes };
};
