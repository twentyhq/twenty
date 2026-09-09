import { Test } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ArtificialAnalysisCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/artificial-analysis-catalog.service';

describe('ArtificialAnalysisCatalogService', () => {
  let service: ArtificialAnalysisCatalogService;
  let configuration: Record<string, unknown>;
  let fetchMock: jest.SpyInstance;

  const snapshot = () => ({
    schemaVersion: 1,
    fetchedAt: new Date().toISOString(),
    intelligenceIndexVersion: 4.3,
    models: [{ id: 'model', name: 'Model', slug: 'model' }],
  });
  const response = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200 });
  const settleRefresh = async () => {
    for (let step = 0; step < 20; step++) {
      await Promise.resolve();
    }
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    configuration = {
      AI_BENCHMARKS_ENABLED: true,
      AI_BENCHMARKS_SNAPSHOT_URL: 'https://benchmarks.example/catalog.json',
    };
    const module = await Test.createTestingModule({
      providers: [
        ArtificialAnalysisCatalogService,
        {
          provide: TwentyConfigService,
          useValue: { get: (key: string) => configuration[key] },
        },
      ],
    }).compile();
    service = module.get(ArtificialAnalysisCatalogService);
    fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('Unavailable'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('returns immediately and deduplicates background downloads', async () => {
    let complete: (value: Response) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    expect(await service.getCatalog()).toBeUndefined();
    expect(await service.getCatalog()).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = snapshot();
    complete(response(body));
    await settleRefresh();
    expect(await service.getCatalog()).toMatchObject(body);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
  });

  it('warms the snapshot without blocking module initialization', async () => {
    fetchMock.mockResolvedValue(response(snapshot()));
    expect(service.onModuleInit()).toBeUndefined();
    await settleRefresh();
    expect((await service.getCatalog())?.models).toHaveLength(1);
  });

  it.each([false, undefined])(
    'skips downloads when disabled or unconfigured (%s)',
    async (enabled) => {
      if (enabled === false) configuration.AI_BENCHMARKS_ENABLED = false;
      else configuration.AI_BENCHMARKS_SNAPSHOT_URL = undefined;
      expect(await service.getCatalog()).toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('retains valid stale data on failure but hides data older than seven days', async () => {
    const body = snapshot();
    fetchMock.mockResolvedValueOnce(response(body));
    await service.getCatalog();
    await settleRefresh();
    jest.setSystemTime(Date.now() + 24 * 60 * 60 * 1000);
    expect(await service.getCatalog()).toMatchObject(body);
    await settleRefresh();
    expect(await service.getCatalog()).toMatchObject(body);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    jest.setSystemTime(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(await service.getCatalog()).toBeUndefined();
    await settleRefresh();
  });

  it.each([
    { schemaVersion: 2 },
    { fetchedAt: 'invalid' },
    { fetchedAt: '2000-01-01T00:00:00.000Z' },
    { fetchedAt: '2100-01-01T00:00:00.000Z' },
    { models: [] },
    {
      models: [
        { id: 'same', name: 'A', slug: 'a' },
        { id: 'same', name: 'B', slug: 'b' },
      ],
    },
  ])('rejects invalid snapshots and backs off retries: %j', async (invalid) => {
    fetchMock.mockResolvedValue(response({ ...snapshot(), ...invalid }));
    await service.getCatalog();
    await settleRefresh();
    expect(await service.getCatalog()).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    jest.setSystemTime(Date.now() + 60 * 60 * 1000);
    await service.getCatalog();
    await settleRefresh();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('discards a pending response after changing source or disabling downloads', async () => {
    let complete: (value: Response) => void = () => {};
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    );
    await service.getCatalog();
    configuration.AI_BENCHMARKS_ENABLED = false;
    expect(await service.getCatalog()).toBeUndefined();
    complete(response(snapshot()));
    await settleRefresh();
    expect(await service.getCatalog()).toBeUndefined();
    configuration.AI_BENCHMARKS_ENABLED = true;
    configuration.AI_BENCHMARKS_SNAPSHOT_URL =
      'https://other.example/catalog.json';
    fetchMock.mockResolvedValue(response(snapshot()));
    await service.getCatalog();
    await settleRefresh();
    expect((await service.getCatalog())?.models).toHaveLength(1);
    expect(fetchMock).toHaveBeenLastCalledWith(
      configuration.AI_BENCHMARKS_SNAPSHOT_URL,
      expect.any(Object),
    );
  });
});
