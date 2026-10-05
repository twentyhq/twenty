import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatConnectionProviderMaps } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider-maps.type';
import { fromConnectionProviderEntityToFlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/utils/from-connection-provider-entity-to-flat-connection-provider.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_CONNECTION_PROVIDER_ROWS_REQUIREMENT = {
  connectionProvider: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatConnectionProviderMaps', { packingPonderation: 1 })
export class WorkspaceFlatConnectionProviderMapCacheService extends MetadataFlatEntityMapsCacheProvider<'connectionProvider'> {
  override readonly rowsRequirement = FLAT_CONNECTION_PROVIDER_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_CONNECTION_PROVIDER_ROWS_REQUIREMENT
  >): FlatConnectionProviderMaps {
    const {
      connectionProvider: connectionProviders,
      application: applications,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatConnectionProviderMaps = createEmptyFlatEntityMaps();

    for (const connectionProviderEntity of connectionProviders) {
      const flatConnectionProvider =
        fromConnectionProviderEntityToFlatConnectionProvider({
          entity: connectionProviderEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatConnectionProvider,
        flatEntityMapsToMutate: flatConnectionProviderMaps,
      });
    }

    return flatConnectionProviderMaps;
  }
}
