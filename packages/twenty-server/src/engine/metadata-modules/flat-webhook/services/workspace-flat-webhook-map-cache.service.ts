import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { fromWebhookEntityToFlatWebhook } from 'src/engine/metadata-modules/flat-webhook/utils/from-webhook-entity-to-flat-webhook.util';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatWebhookMaps')
export class WorkspaceFlatWebhookMapCacheService extends WorkspaceCacheProvider<FlatWebhookMaps> {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatWebhookMaps> {
    const webhooks = await this.webhookRepository.find({
      where: { workspaceId, deletedAt: IsNull() },
    });

    const flatWebhookMaps = createEmptyFlatEntityMaps();

    for (const webhookEntity of webhooks) {
      const flatWebhook = fromWebhookEntityToFlatWebhook(webhookEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatWebhook,
        flatEntityMapsToMutate: flatWebhookMaps,
      });
    }

    return flatWebhookMaps;
  }
}
