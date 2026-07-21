import { fetchLivePartnerProfile } from './fetch-live-partner-profile';
import { partnersApiFetch } from './partners-api-fetch';

jest.mock('./partners-api-fetch');

const mockedFetch = partnersApiFetch as jest.MockedFunction<
  typeof partnersApiFetch
>;

describe('fetchLivePartnerProfile', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps profile payload including flat link URLs and nested collections', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      partner: {
        name: 'Acme',
        slug: 'acme',
        introduction: '## About\n\nFull markdown bio.',
        languagesSpoken: ['ENGLISH'],
        partnerScope: ['ADVISORY'],
        region: ['US'],
        calendarLink: { primaryLinkUrl: 'https://cal.com/acme' },
        hourlyRate: { amountMicros: 150_000_000, currencyCode: 'USD' },
        projectBudgetMin: { amountMicros: 10_000_000_000, currencyCode: 'USD' },
        linkedin: { primaryLinkUrl: 'https://linkedin.com/acme' },
        website: { primaryLinkUrl: 'https://agency-twenty.com' },
        profilePicture: { primaryLinkUrl: 'https://cdn.example/photo.jpg' },
        profileLinks: [
          { primaryLinkUrl: 'https://agency-twenty.com' },
          { primaryLinkUrl: 'https://github.com/acme' },
        ],
        skills: ['CRM'],
        city: 'Paris',
        country: 'FRANCE',
        services: [{ title: 'Discovery', description: 'Workshops' }],
        portfolio: [
          {
            client: 'Globex',
            title: 'Rollout',
            body: 'Markdown case study',
            imageUrl: null,
            link: 'https://example.com/case',
          },
        ],
      },
    });

    expect(await fetchLivePartnerProfile('acme')).toEqual({
      slug: 'acme',
      name: 'Acme',
      description: '## About\n\nFull markdown bio.',
      languagesSpoken: ['ENGLISH'],
      partnerScope: ['ADVISORY'],
      region: ['US'],
      calendarLink: 'https://cal.com/acme',
      hourlyRateUsd: 150,
      projectBudgetMinUsd: 10000,
      links: {
        website: 'https://agency-twenty.com',
        linkedin: 'https://linkedin.com/acme',
        x: null,
        github: null,
      },
      linkUrls: ['https://agency-twenty.com', 'https://github.com/acme'],
      profilePictureUrl: 'https://cdn.example/photo.jpg',
      skills: ['CRM'],
      city: 'Paris',
      country: 'FRANCE',
      services: [{ title: 'Discovery', description: 'Workshops' }],
      portfolio: [
        {
          client: 'Globex',
          title: 'Rollout',
          body: 'Markdown case study',
          imageUrl: null,
          link: 'https://example.com/case',
        },
      ],
      clients: [],
    });
  });

  it('returns undefined when the API reports not found', async () => {
    mockedFetch.mockResolvedValue({ ok: false, reason: 'NOT_FOUND' });
    expect(await fetchLivePartnerProfile('missing')).toBeUndefined();
  });
});
