import { Reflector } from '@nestjs/core';

import { type Request } from 'express';

import { useCachedMetadata } from 'src/engine/api/graphql/graphql-config/hooks/use-cached-metadata';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock('@sentry/node', () => ({
  captureException: jest.fn(),
  getCurrentScope: jest.fn(() => ({ setTransactionName: jest.fn() })),
  setTags: jest.fn(),
  startSpan: jest.fn((_options, callback) =>
    callback({ setAttribute: jest.fn() }),
  ),
}));

jest.mock('@keyv/redis', () => ({}), { virtual: true });

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const FEATURE_FLAG_KEY = 'IS_STALE_BODY_PROBE_ENABLED';
const OPERATION_NAME = 'FeatureFlagProbe';
const MEMOIZER_TTL_MS = 10_000;
const FIVE_SECONDS_AFTER_THE_WRITE_MS = 5_000;

type FeatureFlagRow = { key: string; value: boolean; workspaceId: string };

const createSharedRedis = () => {
  const rawValueByKey = new Map<string, string>();

  return {
    mget: async (keys: string[]) =>
      keys.map((key) => {
        const rawValue = rawValueByKey.get(key);

        return rawValue === undefined ? undefined : JSON.parse(rawValue);
      }),
    msetAndMdel: async ({
      entries,
      keysToDelete,
    }: {
      entries: { key: string; value: unknown }[];
      keysToDelete: string[];
    }) => {
      for (const { key, value } of entries) {
        rawValueByKey.set(key, JSON.stringify(value));
      }
      for (const key of keysToDelete) {
        rawValueByKey.delete(key);
      }
    },
    runScript: async ({ keys, args }: { keys: string[]; args: string[] }) => {
      const published: number[] = [];

      for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 2) {
        const argumentIndex = 1 + (keyIndex / 2) * 3;
        const expectedHash = args[argumentIndex];
        const hashToPublish = args[argumentIndex + 1];
        const data = args[argumentIndex + 2];
        const currentHash = rawValueByKey.get(keys[keyIndex]) ?? '';

        if (currentHash !== expectedHash) {
          published.push(0);
          continue;
        }

        rawValueByKey.set(keys[keyIndex], hashToPublish);

        if (data !== '') {
          rawValueByKey.set(keys[keyIndex + 1], data);
        }

        published.push(1);
      }

      return published;
    },
  };
};

const createPod = ({
  sharedRedis,
  database,
}: {
  sharedRedis: ReturnType<typeof createSharedRedis>;
  database: { featureFlagRows: FeatureFlagRow[] };
}) => {
  const provider = new WorkspaceFeatureFlagsMapCacheService();

  return new WorkspaceCacheService(
    sharedRedis as never,
    {
      getRepository: () => ({
        find: async () => database.featureFlagRows,
      }),
    } as never,
    { getProviders: () => [{ instance: provider }] } as never,
    new Reflector(),
    {
      start: jest.fn(),
      stop: jest.fn(),
      recordRecompute: jest.fn(),
      recordRedisWrite: jest.fn(),
      recordPackingRun: jest.fn(),
      recordUnpacking: jest.fn(),
      recordEviction: jest.fn(),
    } as never,
    { get: () => 3600 } as never,
  );
};

const createResponseCachePlugin = ({
  pod,
  responseBodyByCacheKey,
}: {
  pod: WorkspaceCacheService;
  responseBodyByCacheKey: Map<string, unknown>;
}) =>
  useCachedMetadata({
    cacheGetter: async (key: string) => responseBodyByCacheKey.get(key),
    cacheSetter: (key: string, value: unknown) => {
      responseBodyByCacheKey.set(key, value);
    },
    operationsToCache: {
      [OPERATION_NAME]: {
        scope: 'workspace',
        dependencies: ['featureFlagsMap'],
      },
    },
    dependencyHashGetter: pod.getOrRecomputeCombinedHash.bind(pod),
  });

const createRequest = () =>
  ({
    body: {
      operationName: OPERATION_NAME,
      query: `query ${OPERATION_NAME} { featureFlags }`,
    },
    locale: 'en',
    workspace: { id: WORKSPACE_ID },
  }) as Request;

const serveOperation = async ({
  pod,
  responseBodyByCacheKey,
}: {
  pod: WorkspaceCacheService;
  responseBodyByCacheKey: Map<string, unknown>;
}) => {
  const plugin = createResponseCachePlugin({ pod, responseBodyByCacheKey });
  const serverContext = { req: createRequest() };
  const endResponse = jest.fn();

  await plugin.onRequest?.({ endResponse, serverContext } as never);

  if (endResponse.mock.calls.length > 0) {
    const cachedResponse: Response = endResponse.mock.calls[0][0];

    return { servedFromResponseCache: true, body: await cachedResponse.json() };
  }

  const body = {
    data: await pod.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']),
  };

  await plugin.onResponse?.({
    response: Response.json(body),
    serverContext,
  } as never);

  return { servedFromResponseCache: false, body };
};

describe('stale response body stored under a new hash', () => {
  let podA: WorkspaceCacheService;
  let podB: WorkspaceCacheService;
  let database: { featureFlagRows: FeatureFlagRow[] };
  let responseBodyByCacheKey: Map<string, unknown>;
  let clockOffsetMs: number;

  beforeEach(async () => {
    const realNow = Date.now();

    clockOffsetMs = 0;
    jest.spyOn(Date, 'now').mockImplementation(() => realNow + clockOffsetMs);

    const sharedRedis = createSharedRedis();

    database = {
      featureFlagRows: [
        { key: FEATURE_FLAG_KEY, value: false, workspaceId: WORKSPACE_ID },
      ],
    };
    responseBodyByCacheKey = new Map();
    podA = createPod({ sharedRedis, database });
    podB = createPod({ sharedRedis, database });

    await podA.onModuleInit();
    await podB.onModuleInit();
  });

  afterEach(() => {
    podA.onModuleDestroy();
    podB.onModuleDestroy();
    jest.restoreAllMocks();
  });

  it('keeps old maps on the pod that did not write while Redis already holds the new hash', async () => {
    await podB.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

    database.featureFlagRows = [
      { key: FEATURE_FLAG_KEY, value: true, workspaceId: WORKSPACE_ID },
    ];
    await podA.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);
    clockOffsetMs = FIVE_SECONDS_AFTER_THE_WRITE_MS;

    const { data: podAData, hashes: podAHashes } =
      await podA.getOrRecomputeWithHashes(WORKSPACE_ID, ['featureFlagsMap']);
    const { data: podBData, hashes: podBHeldHashes } =
      await podB.getOrRecomputeWithHashes(WORKSPACE_ID, ['featureFlagsMap']);
    const podBRedisHashes = await podB.getCacheHashes(WORKSPACE_ID, [
      'featureFlagsMap',
    ]);

    expect(podAData.featureFlagsMap).toEqual({ [FEATURE_FLAG_KEY]: true });
    expect(podBData.featureFlagsMap).toEqual({ [FEATURE_FLAG_KEY]: false });
    expect(podBRedisHashes.featureFlagsMap).toBe(podAHashes.featureFlagsMap);
    expect(podBHeldHashes.featureFlagsMap).not.toBe(
      podBRedisHashes.featureFlagsMap,
    );
  });

  it('stores the old body under the new hash and serves it from every pod after the maps have caught up', async () => {
    await podB.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

    database.featureFlagRows = [
      { key: FEATURE_FLAG_KEY, value: true, workspaceId: WORKSPACE_ID },
    ];
    await podA.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);
    clockOffsetMs = FIVE_SECONDS_AFTER_THE_WRITE_MS;

    const newCombinedHash = await podA.getOrRecomputeCombinedHash(
      WORKSPACE_ID,
      ['featureFlagsMap'],
    );

    const firstResponseFromPodB = await serveOperation({
      pod: podB,
      responseBodyByCacheKey,
    });

    expect(firstResponseFromPodB).toEqual({
      servedFromResponseCache: false,
      body: { data: { featureFlagsMap: { [FEATURE_FLAG_KEY]: false } } },
    });
    expect([...responseBodyByCacheKey.keys()]).toHaveLength(1);
    expect([...responseBodyByCacheKey.keys()][0]).toContain(newCombinedHash);

    const responseFromPodA = await serveOperation({
      pod: podA,
      responseBodyByCacheKey,
    });

    expect(responseFromPodA).toEqual({
      servedFromResponseCache: true,
      body: { data: { featureFlagsMap: { [FEATURE_FLAG_KEY]: false } } },
    });

    clockOffsetMs = MEMOIZER_TTL_MS + 1_000;

    const podBDataAfterMemoizerExpiry = await podB.getOrRecompute(
      WORKSPACE_ID,
      ['featureFlagsMap'],
    );
    const laterResponseFromPodB = await serveOperation({
      pod: podB,
      responseBodyByCacheKey,
    });

    expect(podBDataAfterMemoizerExpiry.featureFlagsMap).toEqual({
      [FEATURE_FLAG_KEY]: true,
    });
    expect(laterResponseFromPodB).toEqual({
      servedFromResponseCache: true,
      body: { data: { featureFlagsMap: { [FEATURE_FLAG_KEY]: false } } },
    });
  });

  it('does not store an old body when the pod that serves the request is the one that wrote', async () => {
    await podA.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

    database.featureFlagRows = [
      { key: FEATURE_FLAG_KEY, value: true, workspaceId: WORKSPACE_ID },
    ];
    await podA.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);

    const responseFromPodA = await serveOperation({
      pod: podA,
      responseBodyByCacheKey,
    });

    expect(responseFromPodA).toEqual({
      servedFromResponseCache: false,
      body: { data: { featureFlagsMap: { [FEATURE_FLAG_KEY]: true } } },
    });
  });
});
