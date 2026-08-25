import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectMetadataMaps', { packingPonderation: 6 })
export class WorkspaceFlatObjectMetadataMapCacheService extends FlatEntityMapCacheProvider<'objectMetadata'> {
  override readonly fetchRequirements = {
    objectMetadata: true,
    application: ['id', 'universalIdentifier'],
    fieldMetadata: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    index: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    view: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    objectPermission: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    searchFieldMetadata: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    pageLayout: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['objectMetadataId'],
    },
    commandMenuItem: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['navigationTargetObjectMetadataId'],
    },
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatObjectMetadata> {
    const {
      objectMetadata: objectMetadatas,
      application: applications,
      fieldMetadata: fieldMetadatas,
      index: indexMetadatas,
      view: views,
      objectPermission: objectPermissions,
      searchFieldMetadata: searchFieldMetadatas,
      pageLayout: pageLayouts,
      commandMenuItem: commandMenuItems,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas.rows);

    const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

    for (const objectMetadataEntity of objectMetadatas) {
      const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
        entity: {
          ...objectMetadataEntity,
          fields:
            fieldMetadatas.byObjectMetadataId.get(objectMetadataEntity.id) ||
            [],
          indexMetadatas:
            indexMetadatas.byObjectMetadataId.get(objectMetadataEntity.id) ||
            [],
          views: views.byObjectMetadataId.get(objectMetadataEntity.id) || [],
          objectPermissions:
            objectPermissions.byObjectMetadataId.get(objectMetadataEntity.id) ||
            [],
          searchFieldMetadatas:
            searchFieldMetadatas.byObjectMetadataId.get(
              objectMetadataEntity.id,
            ) || [],
          pageLayouts:
            pageLayouts.byObjectMetadataId.get(objectMetadataEntity.id) || [],
          commandMenuItems:
            commandMenuItems.byNavigationTargetObjectMetadataId.get(
              objectMetadataEntity.id,
            ) || [],
        },
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatObjectMetadata,
        flatEntityMapsToMutate: flatObjectMetadataMaps,
      });
    }

    return flatObjectMetadataMaps;
  }
}
