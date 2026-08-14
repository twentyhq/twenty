import { createHmac, timingSafeEqual } from 'crypto';

// Mailgun signs webhooks with an HMAC-SHA256 hex digest over
// `${timestamp}${token}` keyed with the account's webhook signing key.
export const verifyMailgunSignature = ({
  signingKey,
  timestamp,
  token,
  signature,
}: {
  signingKey: string;
  timestamp: string;
  token: string;
  signature: string;
}): boolean => {
  const expectedSignature = createHmac('sha256', signingKey)
    .update(`${timestamp}${token}`)
    .digest();
  // Buffer.from(..., 'hex') silently truncates at the first invalid
  // character, so a strict shape check has to come first
  const candidateSignature = /^[0-9a-f]{64}$/i.test(signature)
    ? Buffer.from(signature, 'hex')
    : Buffer.alloc(0);

  return (
    candidateSignature.length === expectedSignature.length &&
    timingSafeEqual(candidateSignature, expectedSignature)
  );
};
