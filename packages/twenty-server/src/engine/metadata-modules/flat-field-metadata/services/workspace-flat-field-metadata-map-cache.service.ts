import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

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
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldMetadataMaps', { packingPonderation: 64 })
export class WorkspaceFlatFieldMetadataMapCacheService extends FlatEntityMapCacheProvider<
  'fieldMetadata',
  CompactFlatFieldMetadataMaps
> {
  override readonly fetchRequirements = {
    fieldMetadata: true,
    index: ['id', 'isUnique', 'isSystemSideEffect'],
    indexFieldMetadata: {
      columns: ['id', 'fieldMetadataId', 'subFieldName'],
      groupBy: ['indexMetadataId'],
    },
    objectMetadata: ['id', 'universalIdentifier'],
    application: ['id', 'universalIdentifier'],
    viewField: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['fieldMetadataId'],
    },
    viewFilter: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['fieldMetadataId'],
    },
    viewSort: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['fieldMetadataId'],
    },
    view: {
      columns: ['id', 'universalIdentifier'],
      groupBy: [
        'kanbanAggregateOperationFieldMetadataId',
        'calendarFieldMetadataId',
        'calendarEndFieldMetadataId',
        'mainGroupByFieldMetadataId',
      ],
    },
    searchFieldMetadata: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['fieldMetadataId'],
    },
  } as const;

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

    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const uniqueFieldMetadataIds = computeUniqueFieldMetadataIdsFromIndexes(
      indexMetadatas.map((indexMetadata) => ({
        ...indexMetadata,
        indexFieldMetadatas:
          indexFieldMetadatas.byIndexMetadataId.get(indexMetadata.id) ?? [],
      })),
    );

    const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
        entity: {
          ...fieldMetadataEntity,
          viewFields:
            viewFields.byFieldMetadataId.get(fieldMetadataEntity.id) || [],
          viewFilters:
            viewFilters.byFieldMetadataId.get(fieldMetadataEntity.id) || [],
          kanbanAggregateOperationViews:
            views.byKanbanAggregateOperationFieldMetadataId.get(
              fieldMetadataEntity.id,
            ) || [],
          calendarViews:
            views.byCalendarFieldMetadataId.get(fieldMetadataEntity.id) || [],
          calendarEndViews:
            views.byCalendarEndFieldMetadataId.get(fieldMetadataEntity.id) ||
            [],
          mainGroupByFieldMetadataViews:
            views.byMainGroupByFieldMetadataId.get(fieldMetadataEntity.id) ||
            [],
          viewSorts:
            viewSorts.byFieldMetadataId.get(fieldMetadataEntity.id) || [],
          searchFieldMetadatas:
            searchFieldMetadatas.byFieldMetadataId.get(
              fieldMetadataEntity.id,
            ) || [],
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
