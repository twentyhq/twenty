import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import { CacheStorageNamespace } from 'src/integrations/cache-storage/types/cache-storage-namespace.enum';

@Injectable()
export class CacheStorageService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly namespace: CacheStorageNamespace,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get(`${this.namespace}:${key}`);
  }

  async set<T>(key: string, value: T, ttl?: number) {
    return this.cacheManager.set(`${this.namespace}:${key}`, value, ttl);
  }
}
