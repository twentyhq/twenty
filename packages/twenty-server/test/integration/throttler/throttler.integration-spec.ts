import { randomUUID } from 'node:crypto';

import { caching } from 'cache-manager';
import { redisInsStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';

import { CacheStorageExceptionCode } from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

describe('ThrottlerService consumeTokens (Redis integration)', () => {
  const timeWindow = 3_600_000;
  const testKeys: string[] = [];
  const redisClients: ReturnType<typeof createClient>[] = [];
  let cacheStorage: CacheStorageService;
  let throttlerService: ThrottlerService;
  let otherThrottlerService: ThrottlerService;

  const createTestKey = () => {
    const key = `throttler-consume:${randomUUID()}`;

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

  it('preserves every concurrent debit across two clients, including token debt', async () => {
    const key = createTestKey();
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, index) =>
        (index % 2 === 0
          ? throttlerService
          : otherThrottlerService
        ).consumeTokens(key, 1, 5, timeWindow),
      ),
    );

    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect(
      await throttlerService.getAvailableTokensCount(key, 5, timeWindow),
    ).toBe(-5);
  });

  it('refills an existing JSON bucket and keeps its doubled-window TTL', async () => {
    const key = createTestKey();

    await cacheStorage.set(
      key,
      { tokens: 0, lastRefillAt: Date.now() - timeWindow * 3 },
      timeWindow * 2,
    );

    await throttlerService.consumeTokens(key, 2, 5, timeWindow);

    expect(await cacheStorage.get(key)).toMatchObject({ tokens: 3 });
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

  it('preserves fractional token balances', async () => {
    const key = createTestKey();

    await cacheStorage.set(
      key,
      { tokens: 1.5, lastRefillAt: Date.now() },
      timeWindow * 2,
    );

    await throttlerService.consumeTokens(key, 0.25, 5, timeWindow);

    expect(await cacheStorage.get(key)).toMatchObject({ tokens: 1.25 });
  });

  it('rejects a corrupted bucket without overwriting it', async () => {
    const key = createTestKey();
    const corruptedState = { tokens: 'invalid', lastRefillAt: Date.now() };

    await cacheStorage.set(key, corruptedState, timeWindow * 2);

    await expect(
      throttlerService.consumeTokens(key, 1, 5, timeWindow),
    ).rejects.toMatchObject({
      code: CacheStorageExceptionCode.SCRIPT_EXECUTION_FAILED,
    });
    expect(await cacheStorage.get(key)).toEqual(corruptedState);
  });
});
