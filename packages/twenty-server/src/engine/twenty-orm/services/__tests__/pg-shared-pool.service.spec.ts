import { Test, TestingModule } from '@nestjs/testing';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PgPoolSharedService } from 'src/engine/twenty-orm/services/pg-shared-pool.service';

describe('PgPoolSharedService', () => {
  let service: PgPoolSharedService;
  let configServiceMock: jest.Mocked<TwentyConfigService>;

  beforeEach(async () => {
    // Create config service mock
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'PG_ENABLE_POOL_SHARING') return true;
        if (key === 'PG_POOL_MAX_CONNECTIONS') return 10;

        return undefined;
      }),
    } as unknown as jest.Mocked<TwentyConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PgPoolSharedService,
        {
          provide: TwentyConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<PgPoolSharedService>(PgPoolSharedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check configuration before enabling pool sharing', () => {
    // Set config to disable pool sharing
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'PG_ENABLE_POOL_SHARING') return false;

      return undefined;
    });

    // Initialize service
    service.initialize();

    // Config should be checked
    expect(configServiceMock.get).toHaveBeenCalledWith(
      'PG_ENABLE_POOL_SHARING',
    );

    // Service should track that it's not initialized
    expect(service['initialized']).toBe(false);
  });

  it('should set initialized flag when feature is enabled', () => {
    // Enable feature
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'PG_ENABLE_POOL_SHARING') return true;

      return undefined;
    });

    // Initialize service
    service.initialize();

    // Service should be initialized
    expect(service['initialized']).toBe(true);
  });

  it('should not initialize twice', () => {
    // Spy on the private patchPgPool method
    const patchSpy = jest.spyOn<any, any>(service, 'patchPgPool');

    // Initialize once
    service.initialize();

    // Should have been called once
    expect(patchSpy).toHaveBeenCalledTimes(1);

    // Reset the spy count
    patchSpy.mockClear();

    // Initialize again
    service.initialize();

    // Should not be called again
    expect(patchSpy).not.toHaveBeenCalled();
  });

  it('should expose pools map for testing', () => {
    // Before initialization
    expect(service.getPoolsMapForTesting()).toBeNull();

    // After initialization
    service.initialize();

    // Should return map
    const poolsMap = service.getPoolsMapForTesting();

    expect(poolsMap).not.toBeNull();
    expect(poolsMap instanceof Map).toBe(true);
  });

  it('should read max connections from config when initializing', () => {
    // Set a specific max connections value
    const CUSTOM_MAX = 20;

    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'PG_ENABLE_POOL_SHARING') return true;
      if (key === 'PG_POOL_MAX_CONNECTIONS') return CUSTOM_MAX;

      return undefined;
    });

    // Reset the mock call history
    configServiceMock.get.mockClear();

    // Spy on the logger
    const logSpy = jest.spyOn(service['logger'], 'log');

    // Initialize service
    service.initialize();

    // Verify the config service was called for PG_ENABLE_POOL_SHARING
    expect(configServiceMock.get).toHaveBeenCalledWith(
      'PG_ENABLE_POOL_SHARING',
    );

    // Verify PG_POOL_MAX_CONNECTIONS was called
    expect(
      configServiceMock.get.mock.calls.some(
        (call) => call[0] === 'PG_POOL_MAX_CONNECTIONS',
      ),
    ).toBe(true);

    // Verify the max connections value was logged
    expect(
      logSpy.mock.calls.some((call) =>
        call[0].includes(`${CUSTOM_MAX} connections`),
      ),
    ).toBe(true);
  });
});
