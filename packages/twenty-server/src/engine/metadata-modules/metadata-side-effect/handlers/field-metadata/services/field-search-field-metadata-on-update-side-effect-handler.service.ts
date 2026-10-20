import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findFlatSearchFieldMetadataIndexingField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-flat-search-field-metadata-indexing-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { getPendingFlatSearchFieldMetadataCreatesForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-pending-flat-search-field-metadata-creates-for-object.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldSearchFieldMetadataOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldSearchFieldMetadataOnUpdate',
    description:
      "Keep a field's searchFieldMetadata row in sync when its `isSearchable` flag flips: create the row appended at the end of the object's search vector when it is turned on, delete every row indexing the field when it is turned off. A flag that stays true is a no-op, so the existing row keeps its position and any future per-row settings.",
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const existingFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const searchabilityHasFlipped =
      existingFlatFieldMetadata.isSearchable !== flatFieldMetadata.isSearchable;

    if (!searchabilityHasFlipped) {
      return { status: 'noop' };
    }

    if (!flatFieldMetadata.isSearchable) {
      return this.buildDeleteOperations({
        searchFieldMetadataUniversalIdentifiers:
          existingFlatFieldMetadata.searchFieldMetadataUniversalIdentifiers,
        relatedFlatEntityMaps,
      });
    }

    return this.buildCreateOperations({
      flatFieldMetadata,
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });
  }

  private buildDeleteOperations({
    searchFieldMetadataUniversalIdentifiers,
    relatedFlatEntityMaps,
  }: {
    searchFieldMetadataUniversalIdentifiers: string[];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
  }): MetadataSideEffectResult {
    const searchFieldMetadataToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'searchFieldMetadata'>
    > = {};

    for (const searchFieldMetadataUniversalIdentifier of searchFieldMetadataUniversalIdentifiers) {
      const flatSearchFieldMetadata =
        relatedFlatEntityMaps.flatSearchFieldMetadataMaps.byUniversalIdentifier[
          searchFieldMetadataUniversalIdentifier
        ];

      if (!isDefined(flatSearchFieldMetadata)) {
        continue;
      }

      searchFieldMetadataToDelete[flatSearchFieldMetadata.universalIdentifier] =
        flatSearchFieldMetadata;
    }

    if (Object.keys(searchFieldMetadataToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        searchFieldMetadata: {
          flatEntityToDelete: searchFieldMetadataToDelete,
        },
      },
    };
  }

  private buildCreateOperations({
    flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    flatFieldMetadata: BuildSideEffectsArgs<'fieldMetadata'>['flatEntity'];
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
  }): MetadataSideEffectResult {
    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return { status: 'noop' };
    }

    // The row is what makes the field searchable, so a row that already indexes
    // the field is the row this side effect would create. Queueing the create
    // again would fail the whole plan with ENTITY_ALREADY_EXISTS whenever the
    // derived isSearchable of the cached field metadata lags behind the rows.
    const existingSearchFieldMetadataIndexingField =
      findFlatSearchFieldMetadataIndexingField({
        flatSearchFieldMetadataMaps:
          relatedFlatEntityMaps.flatSearchFieldMetadataMaps,
        fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
        objectMetadataUniversalIdentifier:
          existingFlatObjectMetadata.universalIdentifier,
      });

    if (isDefined(existingSearchFieldMetadataIndexingField)) {
      return { status: 'noop' };
    }

    const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers:
        existingFlatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps: relatedFlatEntityMaps.flatFieldMetadataMaps,
    });

    if (!isDefined(tsVectorFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const existingSearchFieldMetadatas =
      existingFlatObjectMetadata.searchFieldMetadataUniversalIdentifiers
        .map(
          (searchFieldMetadataUniversalIdentifier) =>
            relatedFlatEntityMaps.flatSearchFieldMetadataMaps
              .byUniversalIdentifier[searchFieldMetadataUniversalIdentifier],
        )
        .filter(isDefined);

    const pendingSearchFieldMetadatas =
      getPendingFlatSearchFieldMetadataCreatesForObject({
        objectMetadataUniversalIdentifier:
          existingFlatObjectMetadata.universalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
      });

    const position =
      [...existingSearchFieldMetadatas, ...pendingSearchFieldMetadatas].reduce(
        (maxPosition, searchFieldMetadata) =>
          Math.max(maxPosition, searchFieldMetadata.position),
        -1,
      ) + 1;

    const searchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata: existingFlatObjectMetadata,
      flatFieldMetadata: {
        universalIdentifier: flatFieldMetadata.universalIdentifier,
      },
      tsVectorFlatFieldMetadata: {
        universalIdentifier: tsVectorFlatFieldMetadata.universalIdentifier,
      },
      position,
    });

    return {
      status: 'success',
      operations: {
        searchFieldMetadata: {
          flatEntityToCreate: {
            [searchFieldMetadata.universalIdentifier]: searchFieldMetadata,
          },
        },
      },
    };
  }
}
