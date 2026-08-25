import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type CompactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { compactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/compact-flat-field-metadata-maps.util';
import { expandFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/utils/expand-flat-field-metadata-maps.util';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';

@Injectable()
@WorkspaceCache('flatFieldMetadataMaps', { packingPonderation: 64 })
export class WorkspaceFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatFieldMetadata>,
  CompactFlatFieldMetadataMaps
> {
  override readonly fetchRequirements = [
    entityFetchRequirement(FieldMetadataEntity),
    entityFetchRequirement(IndexMetadataEntity, [
      'id',
      'isUnique',
      'isSystemSideEffect',
    ]),
    entityFetchRequirement(IndexFieldMetadataEntity, [
      'id',
      'indexMetadataId',
      'fieldMetadataId',
      'subFieldName',
    ]),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewFieldEntity, [
      'id',
      'universalIdentifier',
      'fieldMetadataId',
    ]),
    entityFetchRequirement(ViewFilterEntity, [
      'id',
      'universalIdentifier',
      'fieldMetadataId',
    ]),
    entityFetchRequirement(ViewSortEntity, [
      'id',
      'universalIdentifier',
      'fieldMetadataId',
    ]),
    entityFetchRequirement(ViewEntity, [
      'id',
      'universalIdentifier',
      'kanbanAggregateOperationFieldMetadataId',
      'calendarFieldMetadataId',
      'calendarEndFieldMetadataId',
      'mainGroupByFieldMetadataId',
    ]),
    entityFetchRequirement(SearchFieldMetadataEntity, [
      'id',
      'universalIdentifier',
      'fieldMetadataId',
    ]),
  ];

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
    const fieldMetadatas = recomputeContext.getRows(FieldMetadataEntity);
    const indexMetadatas = recomputeContext.getRows(IndexMetadataEntity);
    const indexFieldMetadatas = recomputeContext.getRows(
      IndexFieldMetadataEntity,
    );
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const viewFields = recomputeContext.getRows(ViewFieldEntity);
    const viewFilters = recomputeContext.getRows(ViewFilterEntity);
    const viewSorts = recomputeContext.getRows(ViewSortEntity);
    const views = recomputeContext.getRows(ViewEntity);
    const searchFieldMetadatas = recomputeContext.getRows(
      SearchFieldMetadataEntity,
    );

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
      IndexFieldMetadataEntity[]
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
