import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_OBJECT_METADATA_ROWS_REQUIREMENT = {
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
  fieldPermission: {
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

@Injectable()
@WorkspaceCache('flatObjectMetadataMaps', { packingPonderation: 6 })
export class WorkspaceFlatObjectMetadataMapCacheService extends MetadataFlatEntityMapsCacheProvider<'objectMetadata'> {
  override readonly rowsRequirement = FLAT_OBJECT_METADATA_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_OBJECT_METADATA_ROWS_REQUIREMENT
  >): FlatObjectMetadataMaps {
    const {
      objectMetadata: objectMetadatas,
      application: applications,
      fieldMetadata: fieldMetadatas,
      index: indexMetadatas,
      view: views,
      objectPermission: objectPermissions,
      fieldPermission: fieldPermissions,
      searchFieldMetadata: searchFieldMetadatas,
      pageLayout: pageLayouts,
      commandMenuItem: commandMenuItems,
    } = rows;

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
          fieldPermissions:
            fieldPermissions.byObjectMetadataId.get(objectMetadataEntity.id) ||
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
