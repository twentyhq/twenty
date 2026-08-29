import { communityStatsStore } from './community-stats-store';
import { getCommunityStats } from './get-community-stats';

jest.mock('server-only', () => ({}));

jest.mock('./community-stats-store', () => ({
  communityStatsStore: { read: jest.fn(), write: jest.fn() },
}));

const mockedReadCache = communityStatsStore.read as jest.Mock;
const mockedWriteCache = communityStatsStore.write as jest.Mock;

const ORIGINAL_FETCH = global.fetch;

const githubResponse = (stars: number) =>
  new Response(JSON.stringify({ stargazers_count: stars }), { status: 200 });

const discordResponse = (members: number) =>
  new Response(JSON.stringify({ approximate_member_count: members }), {
    status: 200,
  });

const failedResponse = () => new Response('rate limited', { status: 403 });

describe('getCommunityStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedReadCache.mockResolvedValue(null);
    mockedWriteCache.mockResolvedValue(undefined);
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
  });

  it('should return live numbers when both APIs succeed', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(githubResponse(50123))
      .mockResolvedValueOnce(discordResponse(6712));

    const stats = await getCommunityStats();

    expect(stats).toEqual({ githubStars: 50123, discordMembers: 6712 });
    expect(mockedReadCache).not.toHaveBeenCalled();
    expect(mockedWriteCache).toHaveBeenCalledWith({
      githubStars: 50123,
      discordMembers: 6712,
    });
  });

  it('should fall back to the cached value when a fetch fails', async () => {
    mockedReadCache.mockResolvedValue({
      githubStars: 49999,
      discordMembers: 6666,
    });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(failedResponse())
      .mockResolvedValueOnce(discordResponse(6800));

    const stats = await getCommunityStats();

    expect(stats).toEqual({ githubStars: 49999, discordMembers: 6800 });
  });

  it('should return null when a fetch fails and the cache is empty', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(failedResponse())
      .mockResolvedValueOnce(discordResponse(6800));

    const stats = await getCommunityStats();

    expect(stats).toEqual({ githubStars: null, discordMembers: 6800 });
  });

  it('should return nulls and not write the cache when everything fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(failedResponse())
      .mockResolvedValueOnce(failedResponse());

    const stats = await getCommunityStats();

    expect(stats).toEqual({ githubStars: null, discordMembers: null });
    expect(mockedWriteCache).not.toHaveBeenCalled();
  });

  it('should serve cached values without writing when both fetches fail', async () => {
    mockedReadCache.mockResolvedValue({
      githubStars: 49999,
      discordMembers: 6666,
    });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(failedResponse())
      .mockResolvedValueOnce(failedResponse());

    const stats = await getCommunityStats();

    expect(stats).toEqual({ githubStars: 49999, discordMembers: 6666 });
    expect(mockedWriteCache).not.toHaveBeenCalled();
  });
});
