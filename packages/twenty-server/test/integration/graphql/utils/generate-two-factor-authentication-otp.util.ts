import { isNonEmptyString } from '@sniptt/guards';
import { authenticator } from 'otplib';

const TOTP_STEP_DURATION_MS = 30_000;
const MINIMUM_STEP_REMAINING_MS = 5_000;

type GenerateTwoFactorAuthenticationOtpUtilArgs = {
  provisioningUri: string;
  timeStep?: 'current' | 'previous';
};

export const generateTwoFactorAuthenticationOtp = async ({
  provisioningUri,
  timeStep = 'current',
}: GenerateTwoFactorAuthenticationOtpUtilArgs): Promise<string> => {
  const secret = new URL(provisioningUri).searchParams.get('secret');

  if (!isNonEmptyString(secret)) {
    throw new Error('Expected the provisioning URI to contain a secret');
  }

  const millisecondsRemainingInStep =
    TOTP_STEP_DURATION_MS - (Date.now() % TOTP_STEP_DURATION_MS);

  if (millisecondsRemainingInStep < MINIMUM_STEP_REMAINING_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, millisecondsRemainingInStep + 100),
    );
  }

  return authenticator
    .clone({
      epoch:
        timeStep === 'previous'
          ? Date.now() - TOTP_STEP_DURATION_MS
          : Date.now(),
    })
    .generate(secret);
};
