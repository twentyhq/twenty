/* @license Enterprise */

import { createHmac } from 'crypto';

import { verifyMailgunSignature } from 'src/modules/messaging-webhooks/drivers/mailgun/utils/verify-mailgun-signature.util';

const SIGNING_KEY = 'mailgun-signing-key';

const signFields = (timestamp: string, token: string): string =>
  createHmac('sha256', SIGNING_KEY)
    .update(`${timestamp}${token}`)
    .digest('hex');

describe('verifyMailgunSignature', () => {
  const timestamp = '1700000000';
  const token = 'notification-token';

  it('should accept a signature computed with the signing key', () => {
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token,
        signature: signFields(timestamp, token),
      }),
    ).toBe(true);
  });

  it('should accept an uppercase hex signature', () => {
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token,
        signature: signFields(timestamp, token).toUpperCase(),
      }),
    ).toBe(true);
  });

  it('should reject a signature over different fields', () => {
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token: 'other-token',
        signature: signFields(timestamp, token),
      }),
    ).toBe(false);
  });

  it('should reject a signature computed with another key', () => {
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token,
        signature: createHmac('sha256', 'other-key')
          .update(`${timestamp}${token}`)
          .digest('hex'),
      }),
    ).toBe(false);
  });

  it('should reject malformed signatures without throwing', () => {
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token,
        signature: 'not-hex',
      }),
    ).toBe(false);
    expect(
      verifyMailgunSignature({
        signingKey: SIGNING_KEY,
        timestamp,
        token,
        signature: 'abc123',
      }),
    ).toBe(false);
  });
});
