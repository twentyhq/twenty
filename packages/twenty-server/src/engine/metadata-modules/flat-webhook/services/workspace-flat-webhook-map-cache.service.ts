import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { fromWebhookEntityToFlatWebhook } from 'src/engine/metadata-modules/flat-webhook/utils/from-webhook-entity-to-flat-webhook.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatWebhookMaps', { packingPonderation: 1 })
export class WorkspaceFlatWebhookMapCacheService extends WorkspaceCacheProvider<FlatWebhookMaps> {
  override readonly fetchRequirements = {
    webhook: true,
    application: ['id', 'universalIdentifier', 'deletedAt'],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatWebhookMaps {
    const { webhook: allWebhooks, application: applications } =
      recomputeContext.getRowsByName(this.fetchRequirements);

    // the previous fetches filtered soft-deleted rows in SQL
    const webhooks = allWebhooks.filter(
      (webhook) => !isDefined(webhook.deletedAt),
    );

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

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
