import { getCloudflareContext } from '@opennextjs/cloudflare';

import { communityStatsStore } from './community-stats-store';

jest.mock('server-only', () => ({}));

jest.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: jest.fn(),
}));

const mockedGetCloudflareContext = getCloudflareContext as jest.Mock;

const buildBucket = () => ({ get: jest.fn(), put: jest.fn() });

const bindBucket = (bucket: ReturnType<typeof buildBucket>) => {
  mockedGetCloudflareContext.mockResolvedValue({
    env: { NEXT_INC_CACHE_R2_BUCKET: bucket },
  });
};

const storedObject = (value: unknown) => ({
  text: async () => JSON.stringify(value),
});

describe('communityStatsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read stored stats', async () => {
    const bucket = buildBucket();
    bucket.get.mockResolvedValue(
      storedObject({ githubStars: 50000, discordMembers: 6900 }),
    );
    bindBucket(bucket);

    await expect(communityStatsStore.read()).resolves.toEqual({
      githubStars: 50000,
      discordMembers: 6900,
    });
  });

  it('should return null when no bucket is bound', async () => {
    mockedGetCloudflareContext.mockResolvedValue({ env: {} });

    await expect(communityStatsStore.read()).resolves.toBeNull();
  });

  it('should keep the stored value for a field the caller has no value for', async () => {
    const bucket = buildBucket();
    bucket.get.mockResolvedValue(
      storedObject({ githubStars: 50000, discordMembers: 6900 }),
    );
    bindBucket(bucket);

    await communityStatsStore.write({ githubStars: 50123, discordMembers: null });

    expect(bucket.put).toHaveBeenCalledWith(
      'community-stats/latest.json',
      JSON.stringify({ githubStars: 50123, discordMembers: 6900 }),
    );
  });

  it('should skip the write when the stored entry cannot be read', async () => {
    const bucket = buildBucket();
    bucket.get.mockRejectedValue(new Error('bucket unavailable'));
    bindBucket(bucket);

    await communityStatsStore.write({ githubStars: 50123, discordMembers: null });

    expect(bucket.put).not.toHaveBeenCalled();
  });

  it('should overwrite a corrupt stored entry', async () => {
    const bucket = buildBucket();
    bucket.get.mockResolvedValue({ text: async () => 'not json' });
    bindBucket(bucket);

    await communityStatsStore.write({ githubStars: 50123, discordMembers: null });

    expect(bucket.put).toHaveBeenCalledWith(
      'community-stats/latest.json',
      JSON.stringify({ githubStars: 50123, discordMembers: null }),
    );
  });
});
