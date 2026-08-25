import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromViewSortEntityToFlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/utils/from-view-sort-entity-to-flat-view-sort.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';

@Injectable()
@WorkspaceCache('flatViewSortMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewSortMapCacheService extends WorkspaceCacheProvider<FlatViewSortMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(ViewSortEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(FieldMetadataEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewSortMaps {
    const existingViewSorts = recomputeContext.getRows(ViewSortEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const views = recomputeContext.getRows(ViewEntity);
    const fieldMetadatas = recomputeContext.getRows(FieldMetadataEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatViewSortMaps = createEmptyFlatEntityMaps();

    for (const viewSort of existingViewSorts) {
      const flatViewSort = fromViewSortEntityToFlatViewSort({
        entity: viewSort,
        applicationIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewSort,
        flatEntityMapsToMutate: flatViewSortMaps,
      });
    }

    return flatViewSortMaps;
  }
}
