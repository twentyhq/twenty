import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_ROWS_REQUIREMENT = {
  view: true,
  application: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
  viewField: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
  },
  viewFilter: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
  },
  viewGroup: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
  },
  viewFilterGroup: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
  },
  viewSort: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
    order: { createdAt: 'ASC', id: 'ASC' },
  },
  viewFieldGroup: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatViewMaps', { packingPonderation: 8 })
export class WorkspaceFlatViewMapCacheService extends MetadataFlatEntityMapsCacheProvider<'view'> {
  override readonly rowsRequirement = FLAT_VIEW_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_ROWS_REQUIREMENT
  >): FlatViewMaps {
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
    } = rows;

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
          viewFields: viewFields.byViewId.get(viewEntity.id) || [],
          viewFilters: viewFilters.byViewId.get(viewEntity.id) || [],
          viewGroups: viewGroups.byViewId.get(viewEntity.id) || [],
          viewFilterGroups: viewFilterGroups.byViewId.get(viewEntity.id) || [],
          viewSorts: viewSorts.byViewId.get(viewEntity.id) || [],
          viewFieldGroups: viewFieldGroups.byViewId.get(viewEntity.id) || [],
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
