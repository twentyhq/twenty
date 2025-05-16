import { Logger, LogLevel } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Pool } from 'pg';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PgPoolSharedService } from 'src/engine/twenty-orm/pg-shared-pool/pg-shared-pool.service';

type ConfigKey =
  | 'PG_ENABLE_POOL_SHARING'
  | 'PG_POOL_MAX_CONNECTIONS'
  | 'LOG_LEVELS';

type ConfigValue = boolean | number | LogLevel[] | string;

interface PoolWithEndTracker extends Pool {
  __hasEnded?: boolean;
}

jest.mock('pg', () => {
  const mockPool = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    end: jest.fn().mockImplementation((callback) => {
      if (callback) callback();

      return Promise.resolve();
    }),
    _clients: [],
    _idle: [],
    _pendingQueue: { length: 0 },
  }));

  mockPool.prototype = {
    on: jest.fn(),
    end: jest.fn(),
  };

  return {
    Pool: mockPool,
  };
});

describe('PgPoolSharedService', () => {
  let service: PgPoolSharedService;
  let configService: TwentyConfigService;
  let mockLogger: Partial<Logger>;

  const configValues: Record<ConfigKey, ConfigValue> = {
    PG_ENABLE_POOL_SHARING: true,
    PG_POOL_MAX_CONNECTIONS: 10,
    LOG_LEVELS: ['error', 'warn'],
  };

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PgPoolSharedService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation(
                (key: string) => configValues[key as ConfigKey],
              ),
          },
        },
      ],
    }).compile();

    service = module.get<PgPoolSharedService>(PgPoolSharedService);
    configService = module.get<TwentyConfigService>(TwentyConfigService);

    Object.defineProperty(service, 'logger', {
      value: mockLogger,
      writable: true,
    });
  });

  afterEach(() => {
    if (service && typeof service.unpatchForTesting === 'function') {
      service.unpatchForTesting();
    }
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialize', () => {
    it('should initialize and patch pg Pool when enabled', () => {
      service.initialize();

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Pool sharing will use max 10 connections per pool',
        ),
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Pg pool sharing initialized'),
      );
    });

    it('should not initialize when pool sharing is disabled', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'PG_ENABLE_POOL_SHARING') return false;

        return configValues[key as ConfigKey];
      });

      service.initialize();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Pg pool sharing is disabled by configuration',
      );
      expect(mockLogger.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Pg pool sharing initialized'),
      );
    });

    it('should not initialize twice', () => {
      service.initialize();
      jest.clearAllMocks();

      service.initialize();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Pg pool sharing already initialized, skipping',
      );
    });
  });

  describe('pool sharing functionality', () => {
    beforeEach(() => {
      service.initialize();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should reuse pools with identical connection parameters', () => {
      const pool1 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
      });

      const pool2 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
      });

      expect(pool1).toBe(pool2);

      const poolsMap = service.getPoolsMapForTesting();

      expect(poolsMap?.size).toBe(1);
    });

    it('should create separate pools for different connection parameters', () => {
      const pool1 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'db1',
        user: 'user1',
      });

      const pool2 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'db2',
        user: 'user1',
      });

      expect(pool1).not.toBe(pool2);

      const poolsMap = service.getPoolsMapForTesting();

      expect(poolsMap?.size).toBe(2);
    });

    it('should remove pools from cache when they are ended', async () => {
      const pool = new Pool({
        host: 'localhost',
        database: 'testdb',
      });

      const poolsMapBefore = service.getPoolsMapForTesting();

      expect(poolsMapBefore?.size).toBe(1);

      await pool.end();

      const poolsMapAfter = service.getPoolsMapForTesting();

      expect(poolsMapAfter?.size).toBe(0);

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('pg Pool for key'),
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('has been closed'),
      );
    });

    it('should handle calling end() multiple times on the same pool', async () => {
      const pool = new Pool({
        host: 'localhost',
        database: 'testdb',
      });

      await pool.end();

      expect(service.getPoolsMapForTesting()?.size).toBe(0);

      expect((pool as PoolWithEndTracker).__hasEnded).toBe(true);

      await pool.end();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Ignoring duplicate end() call'),
      );

      const closeMessageCalls = (mockLogger.log as jest.Mock).mock.calls.filter(
        (call: any[]) => call[0].includes('has been closed'),
      );

      expect(closeMessageCalls.length).toBe(1);
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('has been closed'),
      );
    });
  });

  describe('debug logging', () => {
    it('should enable debug logging when debug log level is set', async () => {
      jest
        .spyOn(configService, 'get')
        .mockImplementation((key: string): ConfigValue => {
          if (key === 'LOG_LEVELS') return ['debug', 'error', 'warn'];

          return configValues[key as ConfigKey];
        });

      const module = await Test.createTestingModule({
        providers: [
          PgPoolSharedService,
          {
            provide: TwentyConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const debugService = module.get<PgPoolSharedService>(PgPoolSharedService);

      Object.defineProperty(debugService, 'logger', {
        value: mockLogger,
        writable: true,
      });

      const spyInterval = jest.spyOn(global, 'setInterval');

      debugService.initialize();

      expect(spyInterval).toHaveBeenCalled();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Pool statistics logging enabled'),
      );
    });
  });

  describe('logPoolStats', () => {
    it('should log pool statistics correctly', () => {
      service.initialize();

      new Pool({ host: 'localhost', database: 'testdb' });

      jest.clearAllMocks();

      service.logPoolStats();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        '=== PostgreSQL Connection Pool Stats ===',
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Total pools: 1'),
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('should clear interval on shutdown', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      service['logStatsInterval'] = setInterval(() => {}, 1000);

      service.onApplicationShutdown();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(service['logStatsInterval']).toBeNull();
    });
  });
});
