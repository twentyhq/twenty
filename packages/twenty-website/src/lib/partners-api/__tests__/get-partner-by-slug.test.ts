// Mock next/cache so unstable_cache is a transparent pass-through in tests.
// Without this, Next.js throws "Invariant: incrementalCache missing" outside
// of a Next.js request context.
jest.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

const importGetter = async () => {
  jest.resetModules();
  return (await import('@/lib/partners-api/get-partner-by-slug'))
    .getPartnerBySlug;
};

const apiPartner = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Acme',
  slug: 'acme',
  introduction: 'We do CRM things.',
  languagesSpoken: ['ENGLISH'],
  partnerScope: ['HOSTING'],
  region: ['EUROPE'],
  calendarLink: { primaryLinkUrl: 'https://calendly.com/acme' },
  hourlyRate: { amountMicros: 150_000_000, currencyCode: 'USD' },
  projectBudgetMin: { amountMicros: 5_000_000_000, currencyCode: 'USD' },
  projectBudgetTypical: { amountMicros: 25_000_000_000, currencyCode: 'USD' },
  linkedin: { primaryLinkUrl: 'https://linkedin.com/in/acme' },
  profilePicture: { primaryLinkUrl: 'https://cdn.example.com/acme.jpg' },
  skills: ['INTEGRATIONS'],
  city: 'Berlin',
  country: 'DE',
  ...overrides,
});

const mockApi = (body: unknown, status = 200) => {
  process.env.TWENTY_PARTNERS_API_URL = 'https://example.com';
  process.env.TWENTY_PARTNERS_API_KEY = 'k';
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status }),
  );
};

describe('getPartnerBySlug', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a normalized MarketplacePartner on happy path', async () => {
    mockApi({ ok: true, partner: apiPartner() });
    const getPartnerBySlug = await importGetter();
    const partner = await getPartnerBySlug('acme');
    expect(partner).not.toBeNull();
    expect(partner?.slug).toBe('acme');
    expect(partner?.hourlyRateUsd).toBe(150);
    expect(partner?.linkedinUrl).toBe('https://linkedin.com/in/acme');
    expect(partner?.partnerScope).toEqual(['HOSTING']);
  });

  it('returns null on NOT_FOUND', async () => {
    mockApi({ ok: false, reason: 'NOT_FOUND' });
    const getPartnerBySlug = await importGetter();
    const partner = await getPartnerBySlug('bogus');
    expect(partner).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    process.env.TWENTY_PARTNERS_API_URL = 'https://example.com';
    process.env.TWENTY_PARTNERS_API_KEY = 'k';
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const getPartnerBySlug = await importGetter();
    const partner = await getPartnerBySlug('acme');
    expect(partner).toBeNull();
  });
});
export {};
