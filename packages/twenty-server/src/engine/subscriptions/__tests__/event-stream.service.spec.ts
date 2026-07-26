import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { EVENT_STREAM_TTL_MS } from 'src/engine/subscriptions/constants/event-stream-ttl.constant';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';

const WORKSPACE_ID = 'workspace-id';
const EVENT_STREAM_CHANNEL_ID = 'event-stream-channel-id';
const ACTIVE_STREAM_EXPIRATIONS_KEY = 'activeStreamExpirations';
const ACTIVE_STREAM_EXPIRATION_MEMBER = `${WORKSPACE_ID}:${EVENT_STREAM_CHANNEL_ID}`;

describe('EventStreamService', () => {
  let cacheStorageService: jest.Mocked<CacheStorageService>;
  let service: EventStreamService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-26T12:00:00.000Z'));

    cacheStorageService = {
      del: jest.fn(),
      expire: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      setAdd: jest.fn(),
      setRemove: jest.fn(),
      sortedSetAdd: jest.fn(),
      sortedSetRemove: jest.fn(),
      sortedSetRemoveByScoreAndCount: jest.fn(),
    } as unknown as jest.Mocked<CacheStorageService>;

    service = new EventStreamService(cacheStorageService, {
      createObservableGauge: jest.fn(),
    } as unknown as MetricsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('counts live streams without scanning Redis keys', async () => {
    cacheStorageService.sortedSetRemoveByScoreAndCount.mockResolvedValue(3);

    await expect(service.getTotalActiveStreamCount()).resolves.toBe(3);
    await expect(service.getTotalActiveStreamCount()).resolves.toBe(3);

    expect(
      cacheStorageService.sortedSetRemoveByScoreAndCount,
    ).toHaveBeenCalledTimes(1);
    expect(
      cacheStorageService.sortedSetRemoveByScoreAndCount,
    ).toHaveBeenCalledWith(ACTIVE_STREAM_EXPIRATIONS_KEY, 0, Date.now());
  });

  it('tracks a stream until its Redis TTL expires', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    await service.createEventStream({
      workspaceId: WORKSPACE_ID,
      eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
      authContext: { userId: 'user-id' },
    });

    expect(cacheStorageService.sortedSetAdd).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [
        {
          score: Date.now() + EVENT_STREAM_TTL_MS,
          value: ACTIVE_STREAM_EXPIRATION_MEMBER,
        },
      ],
    );
  });

  it('keeps only existing streams tracked after a refresh', async () => {
    cacheStorageService.expire
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    await expect(
      service.refreshEventStreamTTL({
        workspaceId: WORKSPACE_ID,
        eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
      }),
    ).resolves.toBe(true);

    expect(cacheStorageService.sortedSetAdd).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [
        {
          score: Date.now() + EVENT_STREAM_TTL_MS,
          value: ACTIVE_STREAM_EXPIRATION_MEMBER,
        },
      ],
    );

    cacheStorageService.sortedSetAdd.mockClear();
    cacheStorageService.expire
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(
      service.refreshEventStreamTTL({
        workspaceId: WORKSPACE_ID,
        eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
      }),
    ).resolves.toBe(false);

    expect(cacheStorageService.sortedSetAdd).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [
        {
          score: Date.now() + EVENT_STREAM_TTL_MS,
          value: ACTIVE_STREAM_EXPIRATION_MEMBER,
        },
      ],
    );
    expect(cacheStorageService.sortedSetRemove).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [ACTIVE_STREAM_EXPIRATION_MEMBER],
    );
  });

  it('untracks destroyed and stale streams', async () => {
    await service.destroyEventStream({
      workspaceId: WORKSPACE_ID,
      eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
    });

    expect(cacheStorageService.sortedSetRemove).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [ACTIVE_STREAM_EXPIRATION_MEMBER],
    );

    cacheStorageService.sortedSetRemove.mockClear();

    await service.removeFromActiveStreams(WORKSPACE_ID, [
      EVENT_STREAM_CHANNEL_ID,
      'stale-stream-id',
    ]);

    expect(cacheStorageService.sortedSetRemove).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [ACTIVE_STREAM_EXPIRATION_MEMBER, `${WORKSPACE_ID}:stale-stream-id`],
    );
  });
});
