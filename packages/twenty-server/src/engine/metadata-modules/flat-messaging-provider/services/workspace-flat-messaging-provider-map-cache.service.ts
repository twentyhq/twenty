import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatMessagingProviderMaps } from 'src/engine/metadata-modules/flat-messaging-provider/types/flat-messaging-provider-maps.type';
import { fromMessagingProviderEntityToFlatMessagingProvider } from 'src/engine/metadata-modules/flat-messaging-provider/utils/from-messaging-provider-entity-to-flat-messaging-provider.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_MESSAGING_PROVIDER_ROWS_REQUIREMENT = {
  messagingProvider: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatMessagingProviderMaps', { packingPonderation: 1 })
export class WorkspaceFlatMessagingProviderMapCacheService extends MetadataFlatEntityMapsCacheProvider<'messagingProvider'> {
  override readonly rowsRequirement = FLAT_MESSAGING_PROVIDER_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_MESSAGING_PROVIDER_ROWS_REQUIREMENT
  >): FlatMessagingProviderMaps {
    const { messagingProvider: messagingProviders, application: applications } =
      rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatMessagingProviderMaps = createEmptyFlatEntityMaps();

    for (const messagingProviderEntity of messagingProviders) {
      const flatMessagingProvider =
        fromMessagingProviderEntityToFlatMessagingProvider({
          entity: messagingProviderEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatMessagingProvider,
        flatEntityMapsToMutate: flatMessagingProviderMaps,
      });
    }

    return flatMessagingProviderMaps;
  }
}
