import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type CompactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { compactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/compact-flat-field-metadata-maps.util';
import { expandFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/expand-flat-field-metadata-maps.util';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import {
  type CacheEntityFetchShape,
  type CacheFetchableEntity,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldMetadataMaps', { packingPonderation: 64 })
export class WorkspaceFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatFieldMetadata>,
  CompactFlatFieldMetadataMaps
> {
  override readonly fetchRequirements = {
    fieldMetadata: true,
    index: ['id', 'isUnique', 'isSystemSideEffect'],
    indexFieldMetadata: [
      'id',
      'indexMetadataId',
      'fieldMetadataId',
      'subFieldName',
    ],
    objectMetadata: ['id', 'universalIdentifier'],
    application: ['id', 'universalIdentifier'],
    viewField: ['id', 'universalIdentifier', 'fieldMetadataId'],
    viewFilter: ['id', 'universalIdentifier', 'fieldMetadataId'],
    viewSort: ['id', 'universalIdentifier', 'fieldMetadataId'],
    view: [
      'id',
      'universalIdentifier',
      'kanbanAggregateOperationFieldMetadataId',
      'calendarFieldMetadataId',
      'calendarEndFieldMetadataId',
      'mainGroupByFieldMetadataId',
    ],
    searchFieldMetadata: ['id', 'universalIdentifier', 'fieldMetadataId'],
  } as const satisfies CacheEntityFetchShape;

  override compactForStorage(
    data: FlatEntityMaps<FlatFieldMetadata>,
  ): CompactFlatFieldMetadataMaps {
    return compactFlatFieldMetadataMaps(data);
  }

  override expandFromStorage(
    compactData: CompactFlatFieldMetadataMaps,
  ): FlatEntityMaps<FlatFieldMetadata> {
    return expandFlatFieldMetadataMaps(compactData);
  }

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatFieldMetadata> {
    const {
      fieldMetadata: fieldMetadatas,
      index: indexMetadatas,
      indexFieldMetadata: indexFieldMetadatas,
      objectMetadata: objectMetadatas,
      application: applications,
      viewField: viewFields,
      viewFilter: viewFilters,
      viewSort: viewSorts,
      view: views,
      searchFieldMetadata: searchFieldMetadatas,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const [
      viewFieldsByFieldId,
      viewFiltersByFieldId,
      calendarViewsByFieldId,
      calendarEndViewsByFieldId,
      kanbanViewsByFieldId,
      mainGroupByFieldMetadataViewsByFieldId,
      viewSortsByFieldId,
      searchFieldMetadatasByFieldId,
    ] = (
      [
        {
          entities: viewFields,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: viewFilters,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'calendarFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'calendarEndFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'mainGroupByFieldMetadataId',
        },
        {
          entities: viewSorts,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: searchFieldMetadatas,
          foreignKey: 'fieldMetadataId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const indexFieldMetadatasByIndexMetadataId = new Map<
      string,
      CacheFetchableEntity<'indexFieldMetadata'>[]
    >();

    for (const indexFieldMetadata of indexFieldMetadatas) {
      const existingIndexFieldMetadatas =
        indexFieldMetadatasByIndexMetadataId.get(
          indexFieldMetadata.indexMetadataId,
        );

      if (isDefined(existingIndexFieldMetadatas)) {
        existingIndexFieldMetadatas.push(indexFieldMetadata);
      } else {
        indexFieldMetadatasByIndexMetadataId.set(
          indexFieldMetadata.indexMetadataId,
          [indexFieldMetadata],
        );
      }
    }

    const uniqueFieldMetadataIds = computeUniqueFieldMetadataIdsFromIndexes(
      indexMetadatas.map((indexMetadata) => ({
        ...indexMetadata,
        indexFieldMetadatas:
          indexFieldMetadatasByIndexMetadataId.get(indexMetadata.id) ?? [],
      })),
    );

    const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
        entity: {
          ...fieldMetadataEntity,
          viewFields: viewFieldsByFieldId.get(fieldMetadataEntity.id) || [],
          viewFilters: viewFiltersByFieldId.get(fieldMetadataEntity.id) || [],
          kanbanAggregateOperationViews:
            kanbanViewsByFieldId.get(fieldMetadataEntity.id) || [],
          calendarViews:
            calendarViewsByFieldId.get(fieldMetadataEntity.id) || [],
          calendarEndViews:
            calendarEndViewsByFieldId.get(fieldMetadataEntity.id) || [],
          mainGroupByFieldMetadataViews:
            mainGroupByFieldMetadataViewsByFieldId.get(
              fieldMetadataEntity.id,
            ) || [],
          viewSorts: viewSortsByFieldId.get(fieldMetadataEntity.id) || [],
          searchFieldMetadatas:
            searchFieldMetadatasByFieldId.get(fieldMetadataEntity.id) || [],
        },
        fieldMetadataIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: {
          ...flatFieldMetadata,
          isUnique: uniqueFieldMetadataIds.has(fieldMetadataEntity.id),
        },
        flatEntityMapsToMutate: flatFieldMetadataMaps,
      });
    }

    return flatFieldMetadataMaps;
  }
}
