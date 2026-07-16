import { signPayload } from 'src/modules/executive-search/sync/utils/hmac-sign.util';

describe('signPayload', () => {
  it('should produce a deterministic hex for known inputs', () => {
    const result = signPayload({
      payload: { foo: 'bar' },
      secret: 'my-secret',
      timestamp: '1234567890',
    });

    // t=1234567890,v1=<hex>
    expect(result).toMatch(/^t=1234567890,v1=[a-f0-9]+$/);

    // Deterministic: same inputs produce same output
    const result2 = signPayload({
      payload: { foo: 'bar' },
      secret: 'my-secret',
      timestamp: '1234567890',
    });

    expect(result).toBe(result2);
  });

  it('should return the header in t=...,v1=... format', () => {
    const result = signPayload({
      payload: { event: 'test' },
      secret: 'secret123',
    });

    expect(result).toMatch(/^t=\d+,v1=[a-f0-9]+$/);
  });

  it('should use Date.now() as default timestamp', () => {
    const now = Date.now().toString();

    const result = signPayload({
      payload: { key: 'value' },
      secret: 's3cr3t',
      timestamp: now,
    });

    expect(result).toMatch(new RegExp(`^t=${now},v1=[a-f0-9]+$`));
  });

  it('should produce different signatures for different payloads', () => {
    const result1 = signPayload({
      payload: { a: 1 },
      secret: 'secret',
      timestamp: '1000',
    });
    const result2 = signPayload({
      payload: { a: 2 },
      secret: 'secret',
      timestamp: '1000',
    });

    expect(result1).not.toBe(result2);
  });

  it('should produce different signatures for different secrets', () => {
    const result1 = signPayload({
      payload: { a: 1 },
      secret: 'secret1',
      timestamp: '1000',
    });
    const result2 = signPayload({
      payload: { a: 1 },
      secret: 'secret2',
      timestamp: '1000',
    });

    expect(result1).not.toBe(result2);
  });
});
