import { randomUUID } from 'node:crypto';

import { createClient as createRedisClient } from 'redis';

import { ADD_TO_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/add-to-counters-script.constant';
import { buildCounterScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-counter-script-arguments.util';

const PX_MS = 60_000;

describe('Add-to-counters script', () => {
  const keyPrefix = `integration-tests:add-to-counters:{${randomUUID()}}`;
  let redis: Awaited<ReturnType<typeof createRedisClient>>;

  const buildKey = (keyName: string) => `${keyPrefix}:${keyName}`;

  const addToCounters = (
    keyNames: string[],
    entries: Parameters<typeof buildCounterScriptArguments>[0],
  ) =>
    redis.eval(ADD_TO_COUNTERS_SCRIPT.source, {
      keys: keyNames.map(buildKey),
      arguments: buildCounterScriptArguments(entries),
    });

  const expectLiveTtl = async (keyName: string) => {
    const ttlMs = await redis.pTTL(buildKey(keyName));

    expect(ttlMs).toBeGreaterThan(0);
    expect(ttlMs).toBeLessThanOrEqual(PX_MS);
  };

  beforeAll(async () => {
    redis = await createRedisClient({ url: process.env.REDIS_URL }).connect();
  });

  afterEach(async () => {
    const keys = await redis.keys(`${keyPrefix}:*`);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('answers nil for a cold key without a seed and leaves it cold', async () => {
    expect(await addToCounters(['cold'], [{ amount: 5, seed: null }])).toEqual([
      null,
    ]);
    expect(await redis.exists(buildKey('cold'))).toBe(0);
  });

  it('adds the amount to a warm key', async () => {
    await redis.set(buildKey('warm'), '40');

    expect(await addToCounters(['warm'], [{ amount: 2, seed: null }])).toEqual([
      42,
    ]);
  });

  it('seeds a cold key with its PX and adds the amount on top', async () => {
    expect(
      await addToCounters(
        ['seeded'],
        [{ amount: 3, seed: { value: 600, pxMs: PX_MS } }],
      ),
    ).toEqual([603]);
    await expectLiveTtl('seeded');
  });

  it('seeds a cold key with 0', async () => {
    expect(
      await addToCounters(
        ['zero'],
        [{ amount: 4, seed: { value: 0, pxMs: PX_MS } }],
      ),
    ).toEqual([4]);
  });

  it('keeps the first seed when two callers seed the same key', async () => {
    await addToCounters(
      ['raced'],
      [{ amount: 1, seed: { value: 10, pxMs: PX_MS } }],
    );

    expect(
      await addToCounters(
        ['raced'],
        [{ amount: 2, seed: { value: 500, pxMs: PX_MS } }],
      ),
    ).toEqual([13]);
  });

  it('floors at 0 and keeps the TTL', async () => {
    await addToCounters(
      ['floored'],
      [{ amount: 0, seed: { value: 5, pxMs: PX_MS } }],
    );

    expect(
      await addToCounters(['floored'], [{ amount: -10, seed: null }]),
    ).toEqual([0]);
    expect(await redis.get(buildKey('floored'))).toBe('0');
    await expectLiveTtl('floored');
  });

  it('answers one value per key in order, nil included', async () => {
    await redis.set(buildKey('first'), '5');

    expect(
      await addToCounters(
        ['first', 'second', 'third'],
        [
          { amount: 3, seed: null },
          { amount: 4, seed: null },
          { amount: 7, seed: { value: 0, pxMs: PX_MS } },
        ],
      ),
    ).toEqual([8, null, 7]);
  });
});
