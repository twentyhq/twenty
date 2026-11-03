import { affiliateApplicationRequestSchema } from './affiliate-application-request-schema';

const VALID_REQUEST = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  partnerType: 'CONTENT_CREATOR',
  mainChannel: 'https://youtube.com/@ada',
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

  it('rejects an application without a main channel', () => {
    expect(
      affiliateApplicationRequestSchema.safeParse({
        ...VALID_REQUEST,
        mainChannel: undefined,
      }).success,
    ).toBe(false);
    expect(
      affiliateApplicationRequestSchema.safeParse({
        ...VALID_REQUEST,
        mainChannel: '  ',
      }).success,
    ).toBe(false);
  });

  it('adds https:// to a main channel typed without it', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      mainChannel: 'youtube.com/@ada',
    });

    expect(result.success && result.data.mainChannel).toBe(
      'https://youtube.com/@ada',
    );
  });

  it('rejects an email typed as the main channel', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      mainChannel: 'john@gmail.com',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a main channel that is not a URL', () => {
    const result = affiliateApplicationRequestSchema.safeParse({
      ...VALID_REQUEST,
      mainChannel: 'my newsletter',
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
