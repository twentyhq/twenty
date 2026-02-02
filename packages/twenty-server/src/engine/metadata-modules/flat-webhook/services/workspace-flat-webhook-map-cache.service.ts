import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { fromWebhookEntityToFlatWebhook } from 'src/engine/metadata-modules/flat-webhook/utils/from-webhook-entity-to-flat-webhook.util';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatWebhookMaps')
export class WorkspaceFlatWebhookMapCacheService extends WorkspaceCacheProvider<FlatWebhookMaps> {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatWebhookMaps> {
    const [webhooks, applications] = await Promise.all([
      this.webhookRepository.find({
        where: { workspaceId, deletedAt: IsNull() },
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatWebhookMaps = createEmptyFlatEntityMaps();

    for (const webhookEntity of webhooks) {
      const flatWebhook = fromWebhookEntityToFlatWebhook({
        entity: webhookEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatWebhook,
        flatEntityMapsToMutate: flatWebhookMaps,
      });
    }

    return flatWebhookMaps;
  }
}
