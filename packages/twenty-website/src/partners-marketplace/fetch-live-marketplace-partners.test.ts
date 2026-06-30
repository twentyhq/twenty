import { fetchLiveMarketplacePartners } from './fetch-live-marketplace-partners';
import { partnersApiFetch } from './partners-api-fetch';

jest.mock('./partners-api-fetch');

const mockedFetch = partnersApiFetch as jest.MockedFunction<
  typeof partnersApiFetch
>;

describe('fetchLiveMarketplacePartners', () => {
  afterEach(() => jest.clearAllMocks());

  it('normalizes the CRM payload (micros -> USD, links -> URLs, nulls)', async () => {
    mockedFetch.mockResolvedValue({
      partners: [
        {
          name: 'Acme',
          slug: 'acme',
          introduction: 'Hi',
          languagesSpoken: ['ENGLISH'],
          partnerScope: ['ADVISORY'],
          region: ['US'],
          calendarLink: { primaryLinkUrl: 'cal.com/acme' },
          hourlyRate: { amountMicros: 150_000_000, currencyCode: 'USD' },
          projectBudgetMin: null,
          projectBudgetTypical: null,
          linkedin: { primaryLinkUrl: 'https://linkedin.com/acme' },
          profilePicture: null,
          skills: null,
          city: null,
          country: null,
        },
      ],
    });

    expect(await fetchLiveMarketplacePartners()).toEqual([
      {
        slug: 'acme',
        name: 'Acme',
        introduction: 'Hi',
        languagesSpoken: ['ENGLISH'],
        partnerScope: ['ADVISORY'],
        region: ['US'],
        calendarLink: 'https://cal.com/acme',
        hourlyRateUsd: 150,
        projectBudgetMinUsd: null,
        projectBudgetTypicalUsd: null,
        linkedinUrl: 'https://linkedin.com/acme',
        profilePictureUrl: '',
        skills: [],
        city: '',
        country: '',
      },
    ]);
  });

  it('degrades to [] when the fetch throws', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockedFetch.mockRejectedValue(new Error('boom'));
    expect(await fetchLiveMarketplacePartners()).toEqual([]);
    errorSpy.mockRestore();
  });

  it('degrades to [] when the payload has no partners array', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    mockedFetch.mockResolvedValue({});
    expect(await fetchLiveMarketplacePartners()).toEqual([]);
    errorSpy.mockRestore();
  });
});
