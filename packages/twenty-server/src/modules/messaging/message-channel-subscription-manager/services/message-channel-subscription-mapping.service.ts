import { Injectable } from '@nestjs/common';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const PUBSUB_MAPPING_PREFIX = 'pubsub:email';
const PUBSUB_MAPPING_TTL_MS = 8 * 24 * 60 * 60 * 1000; // 8 days (Gmail watch expires in 7 days)

export type MessagingPubSubMapping = {
  workspaceId: string;
  messageChannelId: string;
};

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

  async addMapping(
    email: string,
    mapping: MessagingPubSubMapping,
  ): Promise<void> {
    const key = this.getMappingKey(email);
    const existingMappings = await this.getMappings(email);

    // Check if mapping already exists
    const exists = existingMappings.some(
      (m) =>
        m.workspaceId === mapping.workspaceId &&
        m.messageChannelId === mapping.messageChannelId,
    );

    if (!exists) {
      existingMappings.push(mapping);
      await this.cacheStorage.set(key, existingMappings, PUBSUB_MAPPING_TTL_MS);
    }
  }

  async getMappings(email: string): Promise<MessagingPubSubMapping[]> {
    const key = this.getMappingKey(email);
    const mappings =
      await this.cacheStorage.get<MessagingPubSubMapping[]>(key);

    return mappings ?? [];
  }

  async removeMapping(email: string, workspaceId: string): Promise<void> {
    const key = this.getMappingKey(email);
    const existingMappings = await this.getMappings(email);

    const filteredMappings = existingMappings.filter(
      (m) => m.workspaceId !== workspaceId,
    );

    if (filteredMappings.length === 0) {
      await this.cacheStorage.del(key);
    } else {
      await this.cacheStorage.set(
        key,
        filteredMappings,
        PUBSUB_MAPPING_TTL_MS,
      );
    }
  }

  async removeMappingByChannel(
    email: string,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    const key = this.getMappingKey(email);
    const existingMappings = await this.getMappings(email);

    const filteredMappings = existingMappings.filter(
      (m) =>
        !(
          m.workspaceId === workspaceId &&
          m.messageChannelId === messageChannelId
        ),
    );

    if (filteredMappings.length === 0) {
      await this.cacheStorage.del(key);
    } else {
      await this.cacheStorage.set(
        key,
        filteredMappings,
        PUBSUB_MAPPING_TTL_MS,
      );
    }
  }

  async refreshMappingTTL(email: string): Promise<void> {
    const key = this.getMappingKey(email);
    const existingMappings = await this.getMappings(email);

    if (existingMappings.length > 0) {
      await this.cacheStorage.set(key, existingMappings, PUBSUB_MAPPING_TTL_MS);
    }
  }
}
