import { signPayload } from 'src/modules/executive-search/sync/utils/hmac-sign.util';
import { verifyHmacSignature } from 'src/modules/executive-search/sync/utils/hmac-verify.util';

describe('verifyHmacSignature', () => {
  const secret = 'my-secret';
  const payload = { hello: 'world' };
  const rawBody = Buffer.from(JSON.stringify(payload));

  it('should return true for a valid signature (round-trip)', () => {
    const signatureHeader = signPayload({
      payload,
      secret,
      timestamp: '1234567890',
    });

    const result = verifyHmacSignature({
      rawBody,
      signatureHeader,
      secret,
    });

    expect(result).toBe(true);
  });

  it('should return false for a tampered body', () => {
    const signatureHeader = signPayload({
      payload,
      secret,
      timestamp: '1234567890',
    });

    const tamperedBody = Buffer.from(JSON.stringify({ hello: 'evil' }));

    const result = verifyHmacSignature({
      rawBody: tamperedBody,
      signatureHeader,
      secret,
    });

    expect(result).toBe(false);
  });

  it('should return false for a wrong secret', () => {
    const signatureHeader = signPayload({
      payload,
      secret: 'other-secret',
      timestamp: '1234567890',
    });

    const result = verifyHmacSignature({
      rawBody,
      signatureHeader,
      secret,
    });

    expect(result).toBe(false);
  });

  it('should return false for a malformed header', () => {
    const result = verifyHmacSignature({
      rawBody,
      signatureHeader: 'malformed-header-value',
      secret,
    });

    expect(result).toBe(false);
  });

  it('should return false for an empty header', () => {
    const result = verifyHmacSignature({
      rawBody,
      signatureHeader: '',
      secret,
    });

    expect(result).toBe(false);
  });

  it('should return false for a header with wrong prefix', () => {
    const result = verifyHmacSignature({
      rawBody,
      signatureHeader: 'x=abc,v1=def123',
      secret,
    });

    expect(result).toBe(false);
  });

  it('should return false for an invalid hex in signature', () => {
    const result = verifyHmacSignature({
      rawBody,
      signatureHeader: 't=1000,v1=not-a-hex-value',
      secret,
    });

    expect(result).toBe(false);
  });

  it('should round-trip with default timestamp', () => {
    const header = signPayload({ payload, secret });
    const body = Buffer.from(JSON.stringify(payload));

    const result = verifyHmacSignature({
      rawBody: body,
      signatureHeader: header,
      secret,
    });

    expect(result).toBe(true);
  });
});
