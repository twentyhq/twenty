import { createHmac } from 'crypto';

import { verifySvixSignature } from 'src/modules/messaging-webhooks/drivers/resend/utils/verify-svix-signature.util';

const SECRET_BYTES = Buffer.from('resend-signing-secret-material');
const SIGNING_SECRET = `whsec_${SECRET_BYTES.toString('base64')}`;

const signPayload = ({
  svixId,
  svixTimestamp,
  rawBody,
}: {
  svixId: string;
  svixTimestamp: string;
  rawBody: Buffer;
}): string => {
  return createHmac('sha256', SECRET_BYTES)
    .update(`${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`)
    .digest('base64');
};

describe('verifySvixSignature', () => {
  const svixId = 'msg_123';
  const svixTimestamp = '1700000000';
  const rawBody = Buffer.from('{"type":"email.bounced"}');

  it('should accept a signature computed with the whsec_-prefixed secret', () => {
    const signature = signPayload({ svixId, svixTimestamp, rawBody });

    expect(
      verifySvixSignature({
        signingSecret: SIGNING_SECRET,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${signature}`,
        rawBody,
      }),
    ).toBe(true);
  });

  it('should accept a secret without the whsec_ prefix', () => {
    const signature = signPayload({ svixId, svixTimestamp, rawBody });

    expect(
      verifySvixSignature({
        signingSecret: SECRET_BYTES.toString('base64'),
        svixId,
        svixTimestamp,
        svixSignature: `v1,${signature}`,
        rawBody,
      }),
    ).toBe(true);
  });

  it('should accept the matching entry among several space-separated signatures', () => {
    const signature = signPayload({ svixId, svixTimestamp, rawBody });

    expect(
      verifySvixSignature({
        signingSecret: SIGNING_SECRET,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${Buffer.from('other').toString('base64')} v1,${signature}`,
        rawBody,
      }),
    ).toBe(true);
  });

  it('should reject a signature over a different body', () => {
    const signature = signPayload({ svixId, svixTimestamp, rawBody });

    expect(
      verifySvixSignature({
        signingSecret: SIGNING_SECRET,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${signature}`,
        rawBody: Buffer.from('{"type":"tampered"}'),
      }),
    ).toBe(false);
  });

  it('should reject a signature computed with another secret', () => {
    const signature = createHmac('sha256', Buffer.from('other-secret'))
      .update(`${svixId}.${svixTimestamp}.${rawBody.toString('utf8')}`)
      .digest('base64');

    expect(
      verifySvixSignature({
        signingSecret: SIGNING_SECRET,
        svixId,
        svixTimestamp,
        svixSignature: `v1,${signature}`,
        rawBody,
      }),
    ).toBe(false);
  });

  it('should reject malformed signature headers', () => {
    expect(
      verifySvixSignature({
        signingSecret: SIGNING_SECRET,
        svixId,
        svixTimestamp,
        svixSignature: 'v1',
        rawBody,
      }),
    ).toBe(false);
  });
});
