import { affiliateApplicationRequestSchema } from './affiliate-application-request-schema';

const VALID_REQUEST = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  partnerType: 'CONTENT_CREATOR',
  acceptsTerms: true,
} as const;

describe('affiliateApplicationRequestSchema', () => {
  it('accepts the minimal application', () => {
    const result = affiliateApplicationRequestSchema.safeParse(VALID_REQUEST);

    expect(result.success).toBe(true);
  });

  it('rejects an application without accepted terms', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      acceptsTerms: false,
    });

    expect(result.success).toBe(false);
  });

  it('rejects an unknown partner type', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      partnerType: 'ASTRONAUT',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a main channel that is not an http URL', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      mainChannel: 'twenty.com',
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown keys', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      referralCode: 'abc',
    });

    expect(result.success).toBe(false);
  });
});
