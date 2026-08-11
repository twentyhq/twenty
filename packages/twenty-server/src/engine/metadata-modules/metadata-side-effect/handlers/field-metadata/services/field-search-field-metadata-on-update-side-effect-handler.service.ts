import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
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
      (existingFlatFieldMetadata.isSearchable === true) !==
      (flatFieldMetadata.isSearchable === true);

    if (!searchabilityHasFlipped) {
      return { status: 'noop' };
    }

    if (flatFieldMetadata.isSearchable !== true) {
      return this.buildDeleteOperations({
        searchFieldMetadataUniversalIdentifiers:
          existingFlatFieldMetadata.searchFieldMetadataUniversalIdentifiers,
        relatedFlatEntityMaps,
      });
    }

    return this.buildCreateOperations({
      flatFieldMetadata,
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
    relatedFlatEntityMaps,
  }: {
    flatFieldMetadata: BuildSideEffectsArgs<'fieldMetadata'>['flatEntity'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
  }): MetadataSideEffectResult {
    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
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

    const position =
      existingSearchFieldMetadatas.reduce(
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
      isSystemSideEffect: false,
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
