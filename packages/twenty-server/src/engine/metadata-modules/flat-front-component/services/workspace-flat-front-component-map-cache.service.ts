import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { fromFrontComponentEntityToFlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-entity-to-flat-front-component.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFrontComponentMaps', { packingPonderation: 1 })
export class WorkspaceFlatFrontComponentMapCacheService extends WorkspaceCacheProvider<FlatFrontComponentMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(FrontComponentEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatFrontComponentMaps {
    const frontComponents = recomputeContext.getRows(FrontComponentEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatFrontComponentMaps = createEmptyFlatEntityMaps();

    for (const frontComponentEntity of frontComponents) {
      const flatFrontComponent = fromFrontComponentEntityToFlatFrontComponent({
        entity: frontComponentEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFrontComponent,
        flatEntityMapsToMutate: flatFrontComponentMaps,
      });
    }

    return flatFrontComponentMaps;
  }
}
