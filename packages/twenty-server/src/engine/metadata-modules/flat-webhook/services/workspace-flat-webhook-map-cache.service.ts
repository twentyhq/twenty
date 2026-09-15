import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWebhookMaps } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook-maps.type';
import { fromWebhookEntityToFlatWebhook } from 'src/engine/metadata-modules/flat-webhook/utils/from-webhook-entity-to-flat-webhook.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_WEBHOOK_ROWS_REQUIREMENT = {
  webhook: { columns: true, where: { deletedAt: IsNull() } },
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatWebhookMaps', { packingPonderation: 1 })
export class WorkspaceFlatWebhookMapCacheService extends MetadataFlatEntityMapsCacheProvider<'webhook'> {
  override readonly rowsRequirement = FLAT_WEBHOOK_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_WEBHOOK_ROWS_REQUIREMENT
  >): FlatWebhookMaps {
    const { webhook: webhooks, application: applications } = rows;

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
