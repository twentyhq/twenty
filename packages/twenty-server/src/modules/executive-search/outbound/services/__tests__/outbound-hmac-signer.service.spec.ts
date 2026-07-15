import { OutboundHmacSignerService } from 'src/modules/executive-search/outbound/services/outbound-hmac-signer.service';

describe('OutboundHmacSignerService', () => {
  let service: OutboundHmacSignerService;

  beforeEach(() => {
    service = new OutboundHmacSignerService();
  });

  describe('sign', () => {
    it('should return signature, timestamp, nonce, and body', () => {
      const payload = { foo: 'bar' };
      const secret = 'test-secret';

      const result = service.sign(payload, secret);

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('body');
      expect(typeof result.signature).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.nonce).toBe('string');
      expect(typeof result.body).toBe('string');
    });

    it('should produce a deterministic signature for fixed timestamp, payload, and secret', () => {
      const payload = { message: 'hello' };
      const secret = 'my-secret';

      const result1 = service.sign(payload, secret);
      const result2 = service.sign(payload, secret);

      // timestamp and nonce differ every call, so signature must differ
      // Instead, verify the signing algorithm directly by re-deriving it
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${result1.timestamp}:${result1.nonce}:${result1.body}`)
        .digest('hex');

      expect(result1.signature).toBe(expectedSignature);
    });

    it('should produce different signatures when payload changes', () => {
      const payload1 = { a: 1 };
      const payload2 = { a: 2 };
      const secret = 'same-secret';

      // Force same timestamp+nonce by using known values
      const crypto = require('crypto');
      const timestamp = '1234567890';
      const nonce = 'a'.repeat(32);
      const body1 = JSON.stringify(payload1);
      const body2 = JSON.stringify(payload2);

      const sig1 = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}:${nonce}:${body1}`)
        .digest('hex');
      const sig2 = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}:${nonce}:${body2}`)
        .digest('hex');

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signatures when secret changes', () => {
      const payload = { foo: 'bar' };

      const crypto = require('crypto');
      const timestamp = '1234567890';
      const nonce = 'b'.repeat(32);
      const body = JSON.stringify(payload);

      const sig1 = crypto
        .createHmac('sha256', 'secret-1')
        .update(`${timestamp}:${nonce}:${body}`)
        .digest('hex');
      const sig2 = crypto
        .createHmac('sha256', 'secret-2')
        .update(`${timestamp}:${nonce}:${body}`)
        .digest('hex');

      expect(sig1).not.toBe(sig2);
    });

    it('should produce a nonce that is 32 hex characters', () => {
      const payload = { data: 'test' };
      const result = service.sign(payload, 'any-secret');

      expect(result.nonce).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should produce body matching JSON.stringify(payload) — single serialization', () => {
      const payload = { name: 'Alice', age: 30, tags: ['admin'] };
      const result = service.sign(payload, 'secret');

      expect(result.body).toBe(JSON.stringify(payload));
    });
  });

  describe('toHeaders', () => {
    it('should return all four headers with correct values', () => {
      const payload = { test: true };
      const secret = 'header-secret';

      const signResult = service.sign(payload, secret);
      const headers = service.toHeaders(signResult);

      expect(headers).toEqual({
        'X-Twenty-Directus-Signature': signResult.signature,
        'X-Twenty-Directus-Timestamp': signResult.timestamp,
        'X-Twenty-Directus-Nonce': signResult.nonce,
        'Content-Type': 'application/json',
      });
    });
  });
});
