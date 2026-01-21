import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const PUBSUB_MAPPING_PREFIX = 'pubsub:email';
const PUBSUB_MAPPING_TTL_MS = 8 * 24 * 60 * 60 * 1000;

export type WorkspaceChannelMapping = Record<string, string>;

@Injectable()
export class MessageChannelSubscriptionMappingService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.ModuleMessaging)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private getMappingKey(email: string): string {
    return `${PUBSUB_MAPPING_PREFIX}:${this.normalizeEmail(email)}`;
  }

  async setMapping(
    email: string,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    const key = this.getMappingKey(email);
    const existing = await this.getMapping(email);

    existing[workspaceId] = messageChannelId;

    await this.cacheStorage.set(key, existing, PUBSUB_MAPPING_TTL_MS);
  }

  async getMapping(email: string): Promise<WorkspaceChannelMapping> {
    const key = this.getMappingKey(email);

    return (await this.cacheStorage.get<WorkspaceChannelMapping>(key)) ?? {};
  }

  async removeMapping(email: string, workspaceId: string): Promise<void> {
    const key = this.getMappingKey(email);
    const existing = await this.getMapping(email);

    delete existing[workspaceId];

    if (Object.keys(existing).length === 0) {
      await this.cacheStorage.del(key);
    } else {
      await this.cacheStorage.set(key, existing, PUBSUB_MAPPING_TTL_MS);
    }
  }

  async refreshMappingTTL(email: string): Promise<void> {
    const key = this.getMappingKey(email);
    const existing = await this.getMapping(email);

    if (Object.keys(existing).length > 0) {
      await this.cacheStorage.set(key, existing, PUBSUB_MAPPING_TTL_MS);
    }
  }
}
