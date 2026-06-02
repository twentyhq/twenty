// Mock next/cache so unstable_cache is a transparent pass-through in tests.
// Without this, Next.js throws "Invariant: incrementalCache missing" outside
// of a Next.js request context.
jest.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

const importGetPartners = async () => {
  jest.resetModules();
  return (await import('@/lib/partners-api/get-partners')).getPartners;
};

const apiPartner = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Acme',
  slug: 'acme',
  introduction: 'We do CRM things.',
  languagesSpoken: ['ENGLISH'],
  partnerScope: ['HOSTING'],
  region: ['EUROPE'],
  calendarLink: { primaryLinkUrl: 'calendly.com/acme' },
  hourlyRate: { amountMicros: 150_000_000, currencyCode: 'USD' },
  projectBudgetMin: { amountMicros: 5_000_000_000, currencyCode: 'USD' },
  projectBudgetTypical: { amountMicros: 25_000_000_000, currencyCode: 'USD' },
  linkedin: { primaryLinkUrl: 'linkedin.com/in/acme' },
  profilePicture: { primaryLinkUrl: 'https://cdn.example.com/acme.jpg' },
  skills: ['INTEGRATIONS', 'MIGRATION'],
  city: 'Berlin',
  country: 'DE',
  ...overrides,
});

const mockApi = (apiPartners: unknown[]) => {
  process.env.TWENTY_PARTNERS_API_URL = 'https://example.com';
  process.env.TWENTY_PARTNERS_API_KEY = 'k';
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({ ok: true, count: apiPartners.length, partners: apiPartners }),
      { status: 200 },
    ),
  );
};

describe('getPartners boundary normalization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes CURRENCY micros to whole USD numbers', async () => {
    mockApi([apiPartner()]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].hourlyRateUsd).toBe(150);
    expect(partners[0].projectBudgetMinUsd).toBe(5000);
    expect(partners[0].projectBudgetTypicalUsd).toBe(25000);
  });

  it('returns null when a CURRENCY field is missing', async () => {
    mockApi([apiPartner({ hourlyRate: null, projectBudgetMin: null })]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].hourlyRateUsd).toBeNull();
    expect(partners[0].projectBudgetMinUsd).toBeNull();
  });

  it('extracts primaryLinkUrl for LINKS fields and prepends scheme when missing', async () => {
    mockApi([apiPartner()]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].linkedinUrl).toBe('https://linkedin.com/in/acme');
    expect(partners[0].profilePictureUrl).toBe('https://cdn.example.com/acme.jpg');
    expect(partners[0].calendarLink).toBe('https://calendly.com/acme');
  });

  it('returns empty string when a LINKS field is missing', async () => {
    mockApi([apiPartner({ linkedin: null, profilePicture: null })]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].linkedinUrl).toBe('');
    expect(partners[0].profilePictureUrl).toBe('');
  });

  it('passes through skills and location fields with empty fallbacks', async () => {
    mockApi([apiPartner({ skills: null, city: null, country: null })]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].skills).toEqual([]);
    expect(partners[0].city).toBe('');
    expect(partners[0].country).toBe('');
  });

  it('passes through partnerScope categories', async () => {
    mockApi([apiPartner({ partnerScope: ['HOSTING', 'SUPPORT'] })]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].partnerScope).toEqual(['HOSTING', 'SUPPORT']);
  });

  it('falls back to an empty array when partnerScope is null', async () => {
    mockApi([apiPartner({ partnerScope: null })]);
    const getPartners = await importGetPartners();
    const partners = await getPartners();
    expect(partners[0].partnerScope).toEqual([]);
  });
});
export {};
