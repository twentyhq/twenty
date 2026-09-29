import { randomUUID } from 'node:crypto';

import { caching } from 'cache-manager';
import { redisInsStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';

import { CacheStorageExceptionCode } from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ThrottlerExceptionCode } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

describe('ThrottlerService token buckets (Redis integration)', () => {
  const timeWindow = 3_600_000;
  const testKeys: string[] = [];
  const redisClients: ReturnType<typeof createClient>[] = [];
  let cacheStorage: CacheStorageService;
  let throttlerService: ThrottlerService;
  let otherThrottlerService: ThrottlerService;

  const createTestKey = () => {
    const key = `throttler-integration:${randomUUID()}`;

    testKeys.push(key);

    return key;
  };

  beforeAll(async () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error('REDIS_URL is required for throttler integration tests');
    }

    const createCacheStorage = async () => {
      const redisClient = createClient({ url: redisUrl });

      redisClients.push(redisClient);
      await redisClient.connect();

      const redisStore = redisInsStore(
        redisClient as Parameters<typeof redisInsStore>[0],
        { ttl: timeWindow * 2 },
      );

      return new CacheStorageService(
        await caching(redisStore),
        CacheStorageNamespace.EngineWorkspace,
      );
    };

    cacheStorage = await createCacheStorage();
    throttlerService = new ThrottlerService(cacheStorage);
    otherThrottlerService = new ThrottlerService(await createCacheStorage());
  });

  afterEach(async () => {
    await cacheStorage.mdel(testKeys);
    testKeys.length = 0;
  });

  afterAll(async () => {
    for (const redisClient of redisClients) {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    }
  });

  it('admits exactly five of thirty concurrent requests across two clients', async () => {
    const key = createTestKey();
    const results = await Promise.allSettled(
      Array.from({ length: 30 }, (_, index) =>
        (index % 2 === 0
          ? throttlerService
          : otherThrottlerService
        ).tokenBucketThrottleOrThrow(key, 1, 5, timeWindow),
      ),
    );
    const accepted = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(accepted).toHaveLength(5);
    expect(rejected).toHaveLength(25);
    expect(accepted.map((result) => result.value).sort()).toEqual([
      0, 1, 2, 3, 4,
    ]);
    for (const result of rejected) {
      expect(result.reason).toMatchObject({
        code: ThrottlerExceptionCode.LIMIT_REACHED,
      });
    }
    expect(
      await throttlerService.getAvailableTokensCount(key, 5, timeWindow),
    ).toBe(0);
  });

  it('accounts for the cost of weighted concurrent requests', async () => {
    const key = createTestKey();
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        throttlerService.tokenBucketThrottleOrThrow(key, 2, 5, timeWindow),
      ),
    );

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(2);
    expect(
      await throttlerService.getAvailableTokensCount(key, 5, timeWindow),
    ).toBe(1);
  });

  it('leaves an exhausted bucket unchanged when rejecting a request', async () => {
    const key = createTestKey();
    const state = { tokens: 1, lastRefillAt: Date.now() };

    await cacheStorage.set(key, state, timeWindow * 2);

    await expect(
      throttlerService.tokenBucketThrottleOrThrow(key, 2, 5, timeWindow),
    ).rejects.toMatchObject({ code: ThrottlerExceptionCode.LIMIT_REACHED });
    expect(await cacheStorage.get(key)).toEqual(state);
  });

  it('reads and updates the existing JSON bucket format', async () => {
    const key = createTestKey();

    await cacheStorage.set(
      key,
      { tokens: 3, lastRefillAt: Date.now() },
      timeWindow * 2,
    );

    await expect(
      throttlerService.tokenBucketThrottleOrThrow(key, 1, 5, timeWindow),
    ).resolves.toBe(2);
    expect(await cacheStorage.get(key)).toMatchObject({ tokens: 2 });
    expect(
      await throttlerService.getAvailableTokensCount(key, 5, timeWindow),
    ).toBe(2);

    const ttl = await cacheStorage.runScript<number>({
      script: {
        name: 'throttler-test:remaining-ttl',
        source: "return redis.call('PTTL', KEYS[1])",
      },
      keys: [key],
      args: [],
    });

    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(timeWindow * 2);
  });

  it('refills an old bucket without exceeding its capacity', async () => {
    const key = createTestKey();

    await cacheStorage.set(
      key,
      { tokens: 0, lastRefillAt: Date.now() - timeWindow * 3 },
      timeWindow * 2,
    );

    await expect(
      throttlerService.tokenBucketThrottleOrThrow(key, 1, 5, timeWindow),
    ).resolves.toBe(4);
  });

  it('keeps independent bucket keys isolated', async () => {
    const firstKey = createTestKey();
    const secondKey = createTestKey();

    const [firstResults, secondResults] = await Promise.all([
      Promise.allSettled(
        Array.from({ length: 10 }, () =>
          throttlerService.tokenBucketThrottleOrThrow(
            firstKey,
            1,
            2,
            timeWindow,
          ),
        ),
      ),
      Promise.allSettled(
        Array.from({ length: 10 }, () =>
          otherThrottlerService.tokenBucketThrottleOrThrow(
            secondKey,
            1,
            3,
            timeWindow,
          ),
        ),
      ),
    ]);

    expect(
      firstResults.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(2);
    expect(
      secondResults.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(3);
  });

  it('preserves every concurrent unconditional debit, including token debt', async () => {
    const key = createTestKey();

    await Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        (index % 2 === 0
          ? throttlerService
          : otherThrottlerService
        ).consumeTokens(key, 1, 5, timeWindow),
      ),
    );

    expect(
      await throttlerService.getAvailableTokensCount(key, 5, timeWindow),
    ).toBe(-5);
  });

  it('preserves fractional token balances', async () => {
    const key = createTestKey();

    await cacheStorage.set(
      key,
      { tokens: 1.5, lastRefillAt: Date.now() },
      timeWindow * 2,
    );

    await expect(
      throttlerService.tokenBucketThrottleOrThrow(key, 0.25, 5, timeWindow),
    ).resolves.toBe(1.25);
    expect(await cacheStorage.get(key)).toMatchObject({ tokens: 1.25 });
  });

  it('rejects a corrupted bucket instead of admitting an unaccounted request', async () => {
    const key = createTestKey();
    const corruptedState = { tokens: 'invalid', lastRefillAt: Date.now() };

    await cacheStorage.set(key, corruptedState, timeWindow * 2);

    await expect(
      throttlerService.tokenBucketThrottleOrThrow(key, 1, 5, timeWindow),
    ).rejects.toMatchObject({
      code: CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
    });
    expect(await cacheStorage.get(key)).toEqual(corruptedState);
  });
});
