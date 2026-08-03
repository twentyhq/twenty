import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { EVENT_STREAM_TTL_MS } from 'src/engine/subscriptions/constants/event-stream-ttl.constant';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';

const WORKSPACE_ID = 'workspace-id';
const EVENT_STREAM_CHANNEL_ID = 'event-stream-channel-id';
const EVENT_STREAM_KEY = `eventStream:${WORKSPACE_ID}:${EVENT_STREAM_CHANNEL_ID}`;
const ACTIVE_STREAMS_KEY = `workspace:${WORKSPACE_ID}:activeStreams`;
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

  it('adds a stream to its functional and metric indexes on creation', async () => {
    cacheStorageService.get.mockResolvedValue(undefined);

    await service.createEventStream({
      workspaceId: WORKSPACE_ID,
      eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
      authContext: { userId: 'user-id' },
    });

    expect(cacheStorageService.set).toHaveBeenCalledWith(
      EVENT_STREAM_KEY,
      {
        authContext: { userId: 'user-id' },
        workspaceId: WORKSPACE_ID,
        queries: {},
        createdAt: Date.now(),
      },
      EVENT_STREAM_TTL_MS,
    );
    expect(cacheStorageService.setAdd).toHaveBeenCalledWith(
      ACTIVE_STREAMS_KEY,
      [EVENT_STREAM_CHANNEL_ID],
      EVENT_STREAM_TTL_MS,
    );
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

  it('tracks a stream after a successful refresh', async () => {
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
    expect(cacheStorageService.sortedSetRemove).not.toHaveBeenCalled();
  });

  it('does not track a stream whose key is missing during refresh', async () => {
    cacheStorageService.expire
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(
      service.refreshEventStreamTTL({
        workspaceId: WORKSPACE_ID,
        eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
      }),
    ).resolves.toBe(false);

    expect(cacheStorageService.sortedSetAdd).not.toHaveBeenCalled();
    expect(cacheStorageService.sortedSetRemove).not.toHaveBeenCalled();
  });

  it('keeps a valid stream tracked when the workspace stream set is missing', async () => {
    cacheStorageService.expire
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

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
    expect(cacheStorageService.sortedSetRemove).not.toHaveBeenCalled();
  });

  it('removes a destroyed stream from its functional and metric indexes', async () => {
    await service.destroyEventStream({
      workspaceId: WORKSPACE_ID,
      eventStreamChannelId: EVENT_STREAM_CHANNEL_ID,
    });

    expect(cacheStorageService.del).toHaveBeenCalledWith(EVENT_STREAM_KEY);
    expect(cacheStorageService.setRemove).toHaveBeenCalledWith(
      ACTIVE_STREAMS_KEY,
      [EVENT_STREAM_CHANNEL_ID],
    );
    expect(cacheStorageService.sortedSetRemove).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [ACTIVE_STREAM_EXPIRATION_MEMBER],
    );
  });

  it('removes stale streams from the functional and metric indexes', async () => {
    await service.removeFromActiveStreams(WORKSPACE_ID, [
      EVENT_STREAM_CHANNEL_ID,
      'stale-stream-id',
    ]);

    expect(cacheStorageService.setRemove).toHaveBeenCalledWith(
      ACTIVE_STREAMS_KEY,
      [EVENT_STREAM_CHANNEL_ID, 'stale-stream-id'],
    );
    expect(cacheStorageService.sortedSetRemove).toHaveBeenCalledWith(
      ACTIVE_STREAM_EXPIRATIONS_KEY,
      [ACTIVE_STREAM_EXPIRATION_MEMBER, `${WORKSPACE_ID}:stale-stream-id`],
    );
  });
  describe('isAuthorized', () => {
    const USER_WORKSPACE_ID = 'user-workspace-id';
    const APPLICATION_ID = 'application-id';

    const check = (
      callerAuthContext: Record<string, string>,
      streamAuthContext: Record<string, string>,
    ) =>
      service.isAuthorized({
        streamData: { authContext: streamAuthContext } as never,
        authContext: callerAuthContext as never,
      });

    it('authorizes the same user on a stream carrying no application', async () => {
      await expect(
        check(
          { userWorkspaceId: USER_WORKSPACE_ID },
          { userWorkspaceId: USER_WORKSPACE_ID },
        ),
      ).resolves.toBe(true);
    });

    it('authorizes the same user carrying the same application', async () => {
      await expect(
        check(
          { userWorkspaceId: USER_WORKSPACE_ID, applicationId: APPLICATION_ID },
          { userWorkspaceId: USER_WORKSPACE_ID, applicationId: APPLICATION_ID },
        ),
      ).resolves.toBe(true);
    });

    // Taking the stream over recreates it with the caller's context, so
    // dropping the application here would drop the bound it puts on events.
    it('denies the same user when the application is dropped', async () => {
      await expect(
        check(
          { userWorkspaceId: USER_WORKSPACE_ID },
          { userWorkspaceId: USER_WORKSPACE_ID, applicationId: APPLICATION_ID },
        ),
      ).resolves.toBe(false);
    });

    it('denies the same user carrying a different application', async () => {
      await expect(
        check(
          {
            userWorkspaceId: USER_WORKSPACE_ID,
            applicationId: 'other-application-id',
          },
          { userWorkspaceId: USER_WORKSPACE_ID, applicationId: APPLICATION_ID },
        ),
      ).resolves.toBe(false);
    });

    it('denies a different user', async () => {
      await expect(
        check(
          { userWorkspaceId: 'other-user-workspace-id' },
          { userWorkspaceId: USER_WORKSPACE_ID },
        ),
      ).resolves.toBe(false);
    });

    it('authorizes the same api key', async () => {
      await expect(
        check({ apiKeyId: 'api-key-id' }, { apiKeyId: 'api-key-id' }),
      ).resolves.toBe(true);
    });

    it('denies a request carrying no principal', async () => {
      await expect(
        check({}, { userWorkspaceId: USER_WORKSPACE_ID }),
      ).resolves.toBe(false);
    });
  });
});
