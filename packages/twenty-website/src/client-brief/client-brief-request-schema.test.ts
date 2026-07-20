import { clientBriefRequestSchema } from './client-brief-request-schema';

const minimalValid = {
  firstName: 'Jane',
  lastName: '',
  email: 'jane@acme.com',
  companyName: 'Acme Real Estate',
  need: 'Migrate from HubSpot',
};

const fullValid = {
  ...minimalValid,
  lastName: 'Smith',
  requirements: 'French UI required',
  hostingType: 'CLOUD' as const,
  country: 'France',
  languages: ['French', 'English'],
  seatCount: '~30',
  timeline: 'Before Q4',
  budgetRange: '$10k–$25k',
};

describe('clientBriefRequestSchema', () => {
  it('accepts the minimal required payload', () => {
    expect(clientBriefRequestSchema.safeParse(minimalValid).success).toBe(true);
  });

  it('accepts the full payload with optional context fields', () => {
    expect(clientBriefRequestSchema.safeParse(fullValid).success).toBe(true);
  });

  it('rejects unknown top-level keys (strictObject)', () => {
    expect(
      clientBriefRequestSchema.safeParse({
        ...minimalValid,
        briefSource: 'website',
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      clientBriefRequestSchema.safeParse({
        ...minimalValid,
        email: 'not-an-email',
      }).success,
    ).toBe(false);
  });

  it('rejects a missing required field', () => {
    expect(
      clientBriefRequestSchema.safeParse({ email: 'jane@acme.com' }).success,
    ).toBe(false);
  });

  it('rejects an unknown hostingType enum value', () => {
    expect(
      clientBriefRequestSchema.safeParse({
        ...minimalValid,
        hostingType: 'ON_PREM',
      }).success,
    ).toBe(false);
  });

  it('rejects empty need after trim', () => {
    expect(
      clientBriefRequestSchema.safeParse({ ...minimalValid, need: '   ' })
        .success,
    ).toBe(false);
  });
});
