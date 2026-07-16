import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const DEFAULT_IDEMPOTENCY_TTL_MS = 86_400_000; // 24h

@Injectable()
export class IdempotencyKeyService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineLock)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async acquire(args: {
    idempotencyKey: string;
    workspaceId: string;
    ttlMs?: number;
  }): Promise<boolean> {
    const key = this.buildKey(args.workspaceId, args.idempotencyKey);
    const ttl = args.ttlMs ?? DEFAULT_IDEMPOTENCY_TTL_MS;

    return this.cacheStorageService.acquireLock(key, ttl);
  }

  async release(args: {
    idempotencyKey: string;
    workspaceId: string;
  }): Promise<void> {
    const key = this.buildKey(args.workspaceId, args.idempotencyKey);

    await this.cacheStorageService.releaseLock(key);
  }

  private buildKey(workspaceId: string, idempotencyKey: string): string {
    return `executive-search:idempotency:${workspaceId}:${idempotencyKey}`;
  }
}
