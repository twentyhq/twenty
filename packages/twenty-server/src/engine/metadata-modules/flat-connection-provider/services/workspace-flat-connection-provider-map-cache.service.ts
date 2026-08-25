import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatConnectionProviderMaps } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider-maps.type';
import { fromConnectionProviderEntityToFlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/utils/from-connection-provider-entity-to-flat-connection-provider.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatConnectionProviderMaps', { packingPonderation: 1 })
export class WorkspaceFlatConnectionProviderMapCacheService extends WorkspaceCacheProvider<FlatConnectionProviderMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatConnectionProviderMaps> {
    const [connectionProviders, applications] = await Promise.all([
      recomputeContext.findAll(ConnectionProviderEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
        'deletedAt',
      ]),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        // the previous application fetch excluded soft-deleted rows
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
