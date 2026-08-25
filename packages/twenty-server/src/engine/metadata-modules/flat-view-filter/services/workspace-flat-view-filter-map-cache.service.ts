import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { fromViewFilterEntityToFlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/utils/from-view-filter-entity-to-flat-view-filter.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFilterMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFilterMapCacheService extends WorkspaceCacheProvider<FlatViewFilterMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(ViewFilterEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(FieldMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewFilterGroupEntity, [
      'id',
      'universalIdentifier',
    ]),
    entityFetchRequirement(ViewEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewFilterMaps {
    const viewFilters = recomputeContext.getRows(ViewFilterEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const fieldMetadatas = recomputeContext.getRows(FieldMetadataEntity);
    const viewFilterGroups = recomputeContext.getRows(ViewFilterGroupEntity);
    const views = recomputeContext.getRows(ViewEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const viewFilterGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFilterGroups);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFilterMaps = createEmptyFlatEntityMaps();

    for (const viewFilterEntity of viewFilters) {
      const flatViewFilter = fromViewFilterEntityToFlatViewFilter({
        entity: viewFilterEntity,
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
        viewFilterGroupIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilter,
        flatEntityMapsToMutate: flatViewFilterMaps,
      });
    }

    return flatViewFilterMaps;
  }
}
