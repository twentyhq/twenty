import { Test } from '@nestjs/testing';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const createPage = (page = 1, hasMore = false) => ({
  intelligence_index_version: 4.3,
  pagination: { page, has_more: hasMore },
  data: [
    {
      id: `model-${page}`,
      name: `Model ${page}`,
      slug: `model-${page}`,
      model_creator: { id: 'creator', name: 'Creator' },
      evaluations: { artificial_analysis_intelligence_index: 62 },
      performance: { median_output_tokens_per_second: 84 },
      artificial_analysis_intelligence_index_cost: {
        cost_per_task: { total_cost: 0.1678 },
      },
    },
  ],
});

const response = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) => new Response(JSON.stringify(body), { status, headers });

describe('ArtificialAnalysisCatalogService', () => {
  let service: ArtificialAnalysisCatalogService;
  let fetchMock: jest.SpyInstance;
  let configuration: Record<string, unknown>;
  let sharedCache: Map<string, { value: string; expiresAt: number }>;
  let cacheStorage: {
    get: jest.Mock;
    set: jest.Mock;
    setIfAbsent: jest.Mock;
    runScript: jest.Mock;
  };

  const createService = async () => {
    const module = await Test.createTestingModule({
      providers: [
        ArtificialAnalysisCatalogService,
        {
          provide: TwentyConfigService,
          useValue: { get: (key: string) => configuration[key] },
        },
        {
          provide: CacheStorageNamespace.EngineAiModelBenchmarks,
          useValue: cacheStorage,
        },
      ],
    }).compile();

    return module.get(ArtificialAnalysisCatalogService);
  };

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-09-08T00:00:00Z'));
    configuration = {
      ARTIFICIAL_ANALYSIS_API_KEY: 'test-key',
      NODE_ENV: NodeEnvironment.PRODUCTION,
    };
    sharedCache = new Map();
    const read = (key: string) => {
      const entry = sharedCache.get(key);

      return entry && entry.expiresAt > Date.now()
        ? JSON.parse(entry.value)
        : undefined;
    };
    const write = (key: string, value: unknown, ttl: number) => {
      sharedCache.set(key, {
        value: JSON.stringify(value),
        expiresAt: ttl === 0 ? Infinity : Date.now() + ttl,
      });
    };

    cacheStorage = {
      get: jest.fn(async (key: string) => read(key)),
      set: jest.fn(async (key: string, value: unknown, ttl: number) =>
        write(key, value, ttl),
      ),
      setIfAbsent: jest.fn(async (key: string, owner: string, ttl: number) => {
        if (read(key)) {
          return false;
        }

        write(key, owner, ttl);

        return true;
      }),
      runScript: jest.fn(
        async ({ keys, args }: { keys: string[]; args: string[] }) => {
          if (JSON.stringify(read(keys[0])) !== args[0]) {
            return 0;
          }
          write(keys[1], JSON.parse(args[1]), Number(args[2]));
          return 1;
        },
      ),
    };
    fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Unexpected fetch'));
    service = await createService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('never fetches from the client-config read path, even with an empty cache', async () => {
    expect(await service.getCatalog()).toBeUndefined();
    expect(await service.getCatalog()).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not overwrite a newer worker after its lease expires', async () => {
    fetchMock.mockImplementationOnce(async () => {
      jest.advanceTimersByTime(61_000);
      await cacheStorage.setIfAbsent('refresh-lock', 'new-owner', 60_000);
      await cacheStorage.set('refresh-state', { nextRefreshAt: 123 }, 0);
      return response(createPage());
    });
    await service.refreshCatalog();
    expect(await cacheStorage.get('refresh-state')).toEqual({
      nextRefreshAt: 123,
    });
    expect(await service.getCatalog()).toBeUndefined();
  });

  it('does not refresh without a key or when explicitly disabled', async () => {
    configuration.ARTIFICIAL_ANALYSIS_API_KEY = undefined;
    await service.refreshCatalog();
    configuration.ARTIFICIAL_ANALYSIS_API_KEY = 'test-key';
    configuration.ARTIFICIAL_ANALYSIS_SYNC_ENABLED = false;
    await service.refreshCatalog();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(cacheStorage.setIfAbsent).not.toHaveBeenCalled();
  });

  it('retains other models when optional benchmark groups are missing', async () => {
    const page = createPage();
    fetchMock.mockResolvedValueOnce(
      response({
        ...page,
        data: [
          ...page.data,
          { id: 'unmeasured', name: 'Unmeasured', slug: 'unmeasured' },
        ],
      }),
    );
    await service.refreshCatalog();
    expect((await service.getCatalog())?.models).toHaveLength(2);
  });

  it.each([NodeEnvironment.DEVELOPMENT, NodeEnvironment.TEST])(
    'requires an explicit opt-in in %s',
    async (environment) => {
      configuration.NODE_ENV = environment;
      await service.refreshCatalog();
      expect(fetchMock).not.toHaveBeenCalled();

      configuration.ARTIFICIAL_ANALYSIS_SYNC_ENABLED = true;
      fetchMock.mockResolvedValueOnce(response(createPage()));
      await service.refreshCatalog();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it('shares the complete daily catalog across servers and restarts', async () => {
    fetchMock
      .mockResolvedValueOnce(response(createPage(1, true)))
      .mockResolvedValueOnce(response(createPage(2)));
    await service.refreshCatalog();
    const catalog = await service.getCatalog();

    expect(catalog?.models).toHaveLength(2);
    expect(
      catalog?.models[0].artificial_analysis_intelligence_index_cost
        ?.cost_per_task?.total_cost,
    ).toBe(0.1678);
    expect(catalog?.intelligenceIndexVersion).toBe(4.3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://artificialanalysis.ai/api/v2/language/models/free?page=2',
      expect.objectContaining({ headers: { 'x-api-key': 'test-key' } }),
    );

    const restartedServer = await createService();

    jest.advanceTimersByTime(23 * HOUR);
    await restartedServer.refreshCatalog();
    expect(await restartedServer.getCatalog()).toEqual(catalog);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await restartedServer.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((await service.getCatalog())?.models).toHaveLength(1);
  });

  it('allows multiple pages to take longer than one request timeout', async () => {
    jest.spyOn(AbortSignal, 'timeout').mockImplementation((milliseconds) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), milliseconds);
      return controller.signal;
    });
    fetchMock.mockImplementation(async (url: string, options: RequestInit) => {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      options.signal?.throwIfAborted();
      const page = Number(new URL(url).searchParams.get('page'));
      return response(createPage(page, page === 1));
    });
    const refresh = service.refreshCatalog();
    await jest.advanceTimersByTimeAsync(6_000);
    await refresh;
    expect((await service.getCatalog())?.models).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('allows only one server to refresh concurrently without blocking readers', async () => {
    const otherServer = await createService();
    let resolveResponse: (value: Response) => void = () => {
      throw new Error('Fetch has not started');
    };
    let signalRequestStarted: () => void = () => {};
    const requestStarted = new Promise<void>((resolve) => {
      signalRequestStarted = resolve;
    });

    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
          signalRequestStarted();
        }),
    );
    const refreshing = service.refreshCatalog();

    await requestStarted;
    await otherServer.refreshCatalog();
    expect(await otherServer.getCatalog()).toBeUndefined();
    resolveResponse(response(createPage()));
    await refreshing;
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(await otherServer.getCatalog()).toEqual(await service.getCatalog());
  });

  it('retains the last complete catalog when a later page fails', async () => {
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await service.refreshCatalog();
    const previous = await service.getCatalog();

    jest.advanceTimersByTime(DAY);
    fetchMock
      .mockResolvedValueOnce(response(createPage(1, true)))
      .mockResolvedValueOnce(response({}, 500));
    await service.refreshCatalog();
    expect(await service.getCatalog()).toEqual(previous);

    jest.advanceTimersByTime(6 * DAY);
    expect(await service.getCatalog()).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('backs off for 1, 2 and 4 hours after consecutive failures', async () => {
    fetchMock.mockImplementation(async () => response({}, 500));
    await service.refreshCatalog();
    jest.advanceTimersByTime(HOUR);
    await service.refreshCatalog();
    jest.advanceTimersByTime(HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(HOUR);
    await service.refreshCatalog();
    jest.advanceTimersByTime(3 * HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(3);

    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(await service.getCatalog()).toBeDefined();
  });

  it('persists the 30-call budget across pagination, retries and key rotation', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      response(createPage(Number(new URL(url).searchParams.get('page')), true)),
    );
    await service.refreshCatalog();
    jest.advanceTimersByTime(HOUR);
    await service.refreshCatalog();
    jest.advanceTimersByTime(2 * HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(30);

    const restartedServer = await createService();

    configuration.ARTIFICIAL_ANALYSIS_API_KEY = 'rotated-key';
    jest.advanceTimersByTime(4 * HOUR);
    await restartedServer.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(30);
    expect(await service.getCatalog()).toBeUndefined();

    jest.advanceTimersByTime(17 * HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await restartedServer.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(31);
    expect(await service.getCatalog()).toBeDefined();
  });

  it('waits for both the provider reset and Retry-After after a 429', async () => {
    fetchMock.mockResolvedValueOnce(
      response({}, 429, {
        'X-RateLimit-Reset': String((Date.now() + 4 * HOUR) / 1000),
        'Retry-After': String((6 * HOUR) / 1000),
      }),
    );
    await service.refreshCatalog();

    const restartedServer = await createService();

    jest.advanceTimersByTime(5 * HOUR);
    await restartedServer.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await restartedServer.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to a 24-hour pause for a 429 without usable headers', async () => {
    fetchMock.mockResolvedValueOnce(
      response({}, 429, {
        'X-RateLimit-Reset': 'invalid',
        'Retry-After': '-1',
      }),
    );
    await service.refreshCatalog();
    jest.advanceTimersByTime(23 * HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses Retry-After when a 429 omits the reset header', async () => {
    fetchMock.mockResolvedValueOnce(
      response({}, 429, { 'Retry-After': String((2 * HOUR) / 1000) }),
    );
    await service.refreshCatalog();
    jest.advanceTimersByTime(HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops pagination when the shared provider quota is exhausted', async () => {
    fetchMock.mockResolvedValueOnce(
      response(createPage(1, true), 200, {
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String((Date.now() + 3 * HOUR) / 1000),
      }),
    );
    await service.refreshCatalog();
    expect(await service.getCatalog()).toBeUndefined();
    jest.advanceTimersByTime(2 * HOUR);
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response(createPage()));
    await service.refreshCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('can publish a complete catalog when the final response uses the last call', async () => {
    fetchMock.mockResolvedValueOnce(
      response(createPage(), 200, { 'X-RateLimit-Remaining': '0' }),
    );
    await service.refreshCatalog();
    expect(await service.getCatalog()).toBeDefined();
  });

  it('rejects malformed data and mixed intelligence index versions', async () => {
    fetchMock
      .mockResolvedValueOnce(response(createPage(1, true)))
      .mockResolvedValueOnce(
        response({ ...createPage(2), intelligence_index_version: 5 }),
      );
    await service.refreshCatalog();
    expect(await service.getCatalog()).toBeUndefined();
    jest.advanceTimersByTime(HOUR);
    fetchMock.mockResolvedValueOnce(response({ data: 'invalid' }));
    await service.refreshCatalog();
    expect(await service.getCatalog()).toBeUndefined();
  });

  it('omits benchmarks when Redis is unavailable without calling the API', async () => {
    cacheStorage.get.mockRejectedValue(new Error('Redis unavailable'));
    expect(await service.getCatalog()).toBeUndefined();
    await service.refreshCatalog();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not send a request if its quota reservation cannot be saved', async () => {
    cacheStorage.runScript.mockRejectedValue(new Error('Redis unavailable'));
    await service.refreshCatalog();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
