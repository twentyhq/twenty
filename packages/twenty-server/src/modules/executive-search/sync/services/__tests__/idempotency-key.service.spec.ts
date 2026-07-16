import { Test, type TestingModule } from '@nestjs/testing';

import { IdempotencyKeyService } from 'src/modules/executive-search/sync/services/idempotency-key.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

describe('IdempotencyKeyService', () => {
  let service: IdempotencyKeyService;
  let mockCacheStorageService: {
    acquireLock: jest.Mock;
    releaseLock: jest.Mock;
  };

  beforeEach(async () => {
    mockCacheStorageService = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyKeyService,
        {
          provide: CacheStorageNamespace.EngineLock,
          useValue: mockCacheStorageService,
        },
      ],
    }).compile();

    service = module.get<IdempotencyKeyService>(IdempotencyKeyService);
  });

  describe('acquire', () => {
    it('should return true when lock is acquired', async () => {
      mockCacheStorageService.acquireLock.mockResolvedValue(true);

      const result = await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
      });

      expect(result).toBe(true);
    });

    it('should return false when lock is already held (duplicate)', async () => {
      mockCacheStorageService.acquireLock
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const first = await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
      });
      const second = await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
      });

      expect(first).toBe(true);
      expect(second).toBe(false);
    });

    it('should build key containing workspaceId and idempotencyKey', async () => {
      mockCacheStorageService.acquireLock.mockResolvedValue(true);

      await service.acquire({
        idempotencyKey: 'evt_789',
        workspaceId: 'ws_999',
      });

      expect(mockCacheStorageService.acquireLock).toHaveBeenCalledWith(
        'executive-search:idempotency:ws_999:evt_789',
        expect.any(Number),
      );
    });

    it('should use default TTL (24h) when not provided', async () => {
      mockCacheStorageService.acquireLock.mockResolvedValue(true);

      await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
      });

      expect(mockCacheStorageService.acquireLock).toHaveBeenCalledWith(
        expect.any(String),
        86_400_000,
      );
    });

    it('should use provided ttlMs when given', async () => {
      mockCacheStorageService.acquireLock.mockResolvedValue(true);

      await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
        ttlMs: 5000,
      });

      expect(mockCacheStorageService.acquireLock).toHaveBeenCalledWith(
        expect.any(String),
        5000,
      );
    });

    it('should namespace keys by workspace', async () => {
      mockCacheStorageService.acquireLock.mockResolvedValue(true);

      await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_aaa',
      });
      await service.acquire({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_bbb',
      });

      expect(mockCacheStorageService.acquireLock).toHaveBeenNthCalledWith(
        1,
        'executive-search:idempotency:ws_aaa:evt_123',
        expect.any(Number),
      );
      expect(mockCacheStorageService.acquireLock).toHaveBeenNthCalledWith(
        2,
        'executive-search:idempotency:ws_bbb:evt_123',
        expect.any(Number),
      );
    });
  });

  describe('release', () => {
    it('should call releaseLock with the correct key', async () => {
      mockCacheStorageService.releaseLock.mockResolvedValue(undefined);

      await service.release({
        idempotencyKey: 'evt_123',
        workspaceId: 'ws_456',
      });

      expect(mockCacheStorageService.releaseLock).toHaveBeenCalledWith(
        'executive-search:idempotency:ws_456:evt_123',
      );
    });
  });
});
