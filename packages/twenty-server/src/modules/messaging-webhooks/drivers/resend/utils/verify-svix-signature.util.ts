import { createHmac, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const SIGNING_SECRET_PREFIX = 'whsec_';

// Svix signatures are an HMAC-SHA256 over `${id}.${timestamp}.${body}` keyed
// with the base64 secret after `whsec_`, carried base64-encoded in the
// space-separated `v1,<sig>` entries of the signature header.
export const verifySvixSignature = ({
  signingSecret,
  svixId,
  svixTimestamp,
  svixSignature,
  rawBody,
}: {
  signingSecret: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  rawBody: Buffer;
}): boolean => {
  const secretKey = Buffer.from(
    signingSecret.startsWith(SIGNING_SECRET_PREFIX)
      ? signingSecret.slice(SIGNING_SECRET_PREFIX.length)
      : signingSecret,
    'base64',
  );

  const expectedSignature = createHmac('sha256', secretKey)
    .update(`${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`)
    .digest();

  return svixSignature
    .split(' ')
    .map((entry) => entry.split(',')[1])
    .filter(isNonEmptyString)
    .some((candidate) => {
      const candidateSignature = Buffer.from(candidate, 'base64');

      return (
        candidateSignature.length === expectedSignature.length &&
        timingSafeEqual(candidateSignature, expectedSignature)
      );
    });
};
