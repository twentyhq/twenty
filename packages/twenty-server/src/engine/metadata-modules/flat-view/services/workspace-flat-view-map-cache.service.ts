import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewMaps', { packingPonderation: 8 })
export class WorkspaceFlatViewMapCacheService extends FlatEntityMapCacheProvider<'view'> {
  override readonly fetchRequirements = {
    view: true,
    application: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
    fieldMetadata: ['id', 'universalIdentifier'],
    viewField: ['id', 'universalIdentifier', 'viewId'],
    viewFilter: ['id', 'universalIdentifier', 'viewId'],
    viewGroup: ['id', 'universalIdentifier', 'viewId'],
    viewFilterGroup: ['id', 'universalIdentifier', 'viewId'],
    viewSort: ['id', 'universalIdentifier', 'viewId'],
    viewFieldGroup: ['id', 'universalIdentifier', 'viewId'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewMaps {
    const {
      view: views,
      application: applications,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
      viewField: viewFields,
      viewFilter: viewFilters,
      viewGroup: viewGroups,
      viewFilterGroup: viewFilterGroups,
      viewSort: viewSorts,
      viewFieldGroup: viewFieldGroups,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [
      viewFieldsByViewId,
      viewFiltersByViewId,
      viewGroupsByViewId,
      viewFilterGroupsByViewId,
      viewSortsByViewId,
      viewFieldGroupsByViewId,
    ] = (
      [
        {
          entities: viewFields,
          foreignKey: 'viewId',
        },
        {
          entities: viewFilters,
          foreignKey: 'viewId',
        },
        {
          entities: viewGroups,
          foreignKey: 'viewId',
        },
        {
          entities: viewFilterGroups,
          foreignKey: 'viewId',
        },
        {
          entities: viewSorts,
          foreignKey: 'viewId',
        },
        {
          entities: viewFieldGroups,
          foreignKey: 'viewId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatViewMaps = createEmptyFlatEntityMaps();

    for (const viewEntity of views) {
      const flatView = fromViewEntityToFlatView({
        entity: {
          ...viewEntity,
          viewFields: viewFieldsByViewId.get(viewEntity.id) || [],
          viewFilters: viewFiltersByViewId.get(viewEntity.id) || [],
          viewGroups: viewGroupsByViewId.get(viewEntity.id) || [],
          viewFilterGroups: viewFilterGroupsByViewId.get(viewEntity.id) || [],
          viewSorts: viewSortsByViewId.get(viewEntity.id) || [],
          viewFieldGroups: viewFieldGroupsByViewId.get(viewEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatView,
        flatEntityMapsToMutate: flatViewMaps,
      });
    }

    return flatViewMaps;
  }
}
