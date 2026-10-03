import { randomUUID } from 'node:crypto';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const LOCK_TTL_MS = 300;

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

describe('CacheLockService (integration)', () => {
  let cacheLockService: CacheLockService;

  beforeAll(() => {
    cacheLockService =
      getAppProviderByClassName<CacheLockService>('CacheLockService');
  });

  it('keeps a second caller out while the first one runs past the lock TTL', async () => {
    const key = `cache-lock-integration:${randomUUID()}`;
    const events: string[] = [];

    const firstCall = cacheLockService.withLock(
      async () => {
        events.push('first:start');
        await wait(LOCK_TTL_MS * 3);
        events.push('first:end');
      },
      key,
      { ttl: LOCK_TTL_MS },
    );

    await wait(LOCK_TTL_MS + 100);

    const secondCall = cacheLockService.withLock(
      async () => {
        events.push('second:start');
      },
      key,
      { ttl: LOCK_TTL_MS, ms: 50, maxRetries: 100 },
    );

    await Promise.all([firstCall, secondCall]);

    expect(events).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('releases the lock once the critical section completes', async () => {
    const key = `cache-lock-integration:${randomUUID()}`;

    await cacheLockService.withLock(async () => undefined, key, {
      ttl: 60_000,
    });

    await expect(
      cacheLockService.withLock(async () => 'acquired', key, {
        maxRetries: 1,
      }),
    ).resolves.toBe('acquired');
  });
});
