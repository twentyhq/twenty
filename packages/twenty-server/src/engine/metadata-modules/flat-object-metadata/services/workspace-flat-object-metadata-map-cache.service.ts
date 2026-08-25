import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectMetadataMaps', { packingPonderation: 6 })
export class WorkspaceFlatObjectMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatObjectMetadata>
> {
  override readonly fetchRequirements = {
    objectMetadata: true,
    application: ['id', 'universalIdentifier'],
    fieldMetadata: ['id', 'universalIdentifier', 'objectMetadataId'],
    index: ['id', 'universalIdentifier', 'objectMetadataId'],
    view: ['id', 'universalIdentifier', 'objectMetadataId'],
    objectPermission: ['id', 'universalIdentifier', 'objectMetadataId'],
    searchFieldMetadata: ['id', 'universalIdentifier', 'objectMetadataId'],
    pageLayout: ['id', 'universalIdentifier', 'objectMetadataId'],
    commandMenuItem: [
      'id',
      'universalIdentifier',
      'navigationTargetObjectMetadataId',
    ],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatObjectMetadata> {
    const {
      objectMetadata: objectMetadatas,
      application: applications,
      fieldMetadata: fields,
      index: indexMetadatas,
      view: views,
      objectPermission: objectPermissions,
      searchFieldMetadata: searchFieldMetadatas,
      pageLayout: pageLayouts,
      commandMenuItem: commandMenuItems,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [
      fieldsByObjectId,
      indexesByObjectId,
      viewsByObjectId,
      objectPermissionsByObjectId,
      searchFieldMetadatasByObjectId,
      pageLayoutsByObjectId,
      commandMenuItemsByObjectId,
    ] = (
      [
        {
          entities: fields,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: indexMetadatas,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: views,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: objectPermissions,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: searchFieldMetadatas,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: pageLayouts,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: commandMenuItems,
          foreignKey: 'navigationTargetObjectMetadataId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fields);

    const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

    for (const objectMetadataEntity of objectMetadatas) {
      const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
        entity: {
          ...objectMetadataEntity,
          fields: fieldsByObjectId.get(objectMetadataEntity.id) || [],
          indexMetadatas: indexesByObjectId.get(objectMetadataEntity.id) || [],
          views: viewsByObjectId.get(objectMetadataEntity.id) || [],
          objectPermissions:
            objectPermissionsByObjectId.get(objectMetadataEntity.id) || [],
          searchFieldMetadatas:
            searchFieldMetadatasByObjectId.get(objectMetadataEntity.id) || [],
          pageLayouts: pageLayoutsByObjectId.get(objectMetadataEntity.id) || [],
          commandMenuItems:
            commandMenuItemsByObjectId.get(objectMetadataEntity.id) || [],
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
