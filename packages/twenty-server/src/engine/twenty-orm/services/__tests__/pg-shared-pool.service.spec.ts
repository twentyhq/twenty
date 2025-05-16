import { Logger, LogLevel } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Pool } from 'pg';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PgPoolSharedService } from 'src/engine/twenty-orm/services/pg-shared-pool.service';

// Define config keys to avoid 'any' type index errors
type ConfigKey =
  | 'PG_ENABLE_POOL_SHARING'
  | 'PG_POOL_MAX_CONNECTIONS'
  | 'LOG_LEVELS';

// Define return types for config values to avoid 'unknown' error
type ConfigValue = boolean | number | LogLevel[] | string;

// Define pool interface matching our implementation
interface PoolWithEndTracker extends Pool {
  __hasEnded?: boolean;
}

// Mock the pg module
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PgPoolSharedService,
        {
          provide: TwentyConfigService,
          useValue: {
            // Type cast for the mock function to match TwentyConfigService
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

    // Replace the logger with our mock
    (service as any).logger = mockLogger;
  });

  afterEach(() => {
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
      jest
        .spyOn(configService, 'get')
        .mockImplementation((key: string): ConfigValue => {
          if (key === 'PG_ENABLE_POOL_SHARING') return false;

          return configValues[key as ConfigKey];
        });

      service.initialize();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Pg pool sharing is disabled by configuration',
      );
      // Ensure it doesn't log initialization success
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
      jest.clearAllMocks();
    });

    it('should reuse pools with identical connection parameters', () => {
      // Create first pool
      const pool1 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
      });

      // Create second pool with identical parameters
      const pool2 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        user: 'testuser',
      });

      // The pools should be the same instance
      expect(pool1).toBe(pool2);

      // Check that only one pool was created
      const poolsMap = service.getPoolsMapForTesting();

      expect(poolsMap?.size).toBe(1);
    });

    it('should create separate pools for different connection parameters', () => {
      // Create first pool
      const pool1 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'db1',
        user: 'user1',
      });

      // Create second pool with different parameters
      const pool2 = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'db2', // Different database
        user: 'user1',
      });

      // The pools should be different instances
      expect(pool1).not.toBe(pool2);

      // Check that two pools were created
      const poolsMap = service.getPoolsMapForTesting();

      expect(poolsMap?.size).toBe(2);
    });

    it('should remove pools from cache when they are ended', async () => {
      // Create a pool
      const pool = new Pool({
        host: 'localhost',
        database: 'testdb',
      });

      // Verify pool exists in cache
      const poolsMapBefore = service.getPoolsMapForTesting();

      expect(poolsMapBefore?.size).toBe(1);

      // End the pool
      await pool.end();

      // Verify pool was removed from cache
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
      // Create a pool
      const pool = new Pool({
        host: 'localhost',
        database: 'testdb',
      });

      // End the pool once
      await pool.end();

      // Verify cache was cleared (only once)
      expect(service.getPoolsMapForTesting()?.size).toBe(0);

      // First call should have marked the pool as ended
      expect((pool as PoolWithEndTracker).__hasEnded).toBe(true);

      // Try to end it again - should succeed silently now
      await pool.end();

      // Should have logged a debug message
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Ignoring duplicate end() call'),
      );

      // Verify we only logged the close message once
      expect(mockLogger.log).toHaveBeenCalledTimes(1);
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('has been closed'),
      );
    });
  });

  describe('debug logging', () => {
    it('should enable debug logging when debug log level is set', async () => {
      // Enable debug log level
      jest
        .spyOn(configService, 'get')
        .mockImplementation((key: string): ConfigValue => {
          if (key === 'LOG_LEVELS') return ['debug', 'error', 'warn'];

          return configValues[key as ConfigKey];
        });

      // Re-create service to pick up new log levels
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

      (debugService as any).logger = mockLogger;

      // Initialize should set up periodic logging
      const spyInterval = jest.spyOn(global, 'setInterval');

      debugService.initialize();

      // Check that interval was set
      expect(spyInterval).toHaveBeenCalled();

      // Check that initial stats were logged
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Pool statistics logging enabled'),
      );
    });
  });

  describe('logPoolStats', () => {
    it('should log pool statistics correctly', () => {
      // Set up a test pool with mock statistics
      service.initialize();

      // Create a pool to log stats for
      new Pool({ host: 'localhost', database: 'testdb' });

      // Clear previous logs
      jest.clearAllMocks();

      // Log the pool stats
      service.logPoolStats();

      // Verify stats are logged
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

      // Set a mock interval
      (service as any).logStatsInterval = setInterval(() => {}, 1000);

      service.onApplicationShutdown();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect((service as any).logStatsInterval).toBeNull();
    });
  });
});
