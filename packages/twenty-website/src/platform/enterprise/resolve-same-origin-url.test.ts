import { resolveSameOriginUrl } from './resolve-same-origin-url';

const BASE_URL = 'https://twenty.com';

describe('resolveSameOriginUrl', () => {
  it('should resolve a relative path against the base origin', () => {
    expect(resolveSameOriginUrl('/settings/billing', BASE_URL)).toBe(
      'https://twenty.com/settings/billing',
    );
  });

  it('should keep query and fragment when resolving a relative path', () => {
    expect(resolveSameOriginUrl('/activate?plan=yearly#top', BASE_URL)).toBe(
      'https://twenty.com/activate?plan=yearly#top',
    );
  });

  it('should preserve Stripe template placeholders unencoded', () => {
    expect(
      resolveSameOriginUrl(
        '/enterprise/activate?session_id={CHECKOUT_SESSION_ID}',
        BASE_URL,
      ),
    ).toBe(
      'https://twenty.com/enterprise/activate?session_id={CHECKOUT_SESSION_ID}',
    );
  });

  it('should accept an absolute url on the same origin', () => {
    expect(resolveSameOriginUrl('https://twenty.com/pricing', BASE_URL)).toBe(
      'https://twenty.com/pricing',
    );
  });

  describe('when the candidate would escape the origin under concatenation', () => {
    // `${BASE_URL}${candidate}` sends these to an attacker host. Resolving
    // through the URL parser keeps them on the base origin instead.
    it.each([
      ['.evil.com', 'https://twenty.com/.evil.com'],
      ['@evil.com', 'https://twenty.com/@evil.com'],
    ])(
      'should neutralize %s into a same-origin path',
      (candidate, expected) => {
        expect(resolveSameOriginUrl(candidate, BASE_URL)).toBe(expected);
      },
    );

    it.each([
      '//evil.com',
      '/\\evil.com',
      '\\\\evil.com',
      'https://evil.com',
      'https://twenty.com.evil.com',
      'https://twenty.com@evil.com',
      'http://twenty.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
    ])('should reject %s', (candidate) => {
      expect(resolveSameOriginUrl(candidate, BASE_URL)).toBeNull();
    });
  });

  it('should reject a candidate longer than the maximum length', () => {
    expect(resolveSameOriginUrl(`/${'a'.repeat(2048)}`, BASE_URL)).toBeNull();
  });

  it('should reject an empty string', () => {
    expect(resolveSameOriginUrl('', BASE_URL)).toBeNull();
  });

  it.each([undefined, null, 42, {}, ['/settings']])(
    'should reject the non-string candidate %p',
    (candidate) => {
      expect(resolveSameOriginUrl(candidate, BASE_URL)).toBeNull();
    },
  );

  it('should reject when the base url is not a valid url', () => {
    expect(resolveSameOriginUrl('/settings', 'not-a-url')).toBeNull();
  });
});
