import { fetchMarketplaceAppDetailBySlug } from './fetch-marketplace-app-detail';
import { marketplaceGraphqlRequest } from './marketplace-api-fetch';

jest.mock('./marketplace-api-fetch');

const mockedRequest = marketplaceGraphqlRequest as jest.MockedFunction<
  typeof marketplaceGraphqlRequest
>;

const listPayload = {
  publicMarketplaceApps: [
    {
      id: 'app-1',
      name: 'Slack',
      description: 'Use Twenty from Slack',
      author: 'Twenty',
      category: 'Communication',
      logoUrl: null,
      sourcePackage: '@twentyhq/slack',
    },
  ],
};

describe('fetchMarketplaceAppDetailBySlug', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  it('throws when the catalog cannot be loaded, instead of reporting the app as missing', async () => {
    mockedRequest.mockRejectedValue(new Error('Twenty marketplace API 503'));

    await expect(fetchMarketplaceAppDetailBySlug('slack')).rejects.toThrow(
      'Twenty marketplace API 503',
    );
  });

  it('returns null for a slug the loaded catalog does not list', async () => {
    mockedRequest.mockResolvedValue(listPayload);

    await expect(
      fetchMarketplaceAppDetailBySlug('does-not-exist'),
    ).resolves.toBeNull();
  });

  it('falls back to the catalog entry when only the detail request fails', async () => {
    mockedRequest
      .mockResolvedValueOnce(listPayload)
      .mockRejectedValueOnce(new Error('Twenty marketplace API 500'));

    await expect(fetchMarketplaceAppDetailBySlug('slack')).resolves.toEqual(
      expect.objectContaining({ name: 'Slack', screenshots: [] }),
    );
  });
});
