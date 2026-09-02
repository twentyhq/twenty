import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { getPendingFlatSearchFieldMetadataCreatesForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-pending-flat-search-field-metadata-creates-for-object.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldSearchFieldMetadataOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldSearchFieldMetadataOnCreate',
    description:
      "Provision the searchFieldMetadata row for a field created with `isSearchable: true`, appended at the end of the object's search vector, so a create input carrying the flag actually contributes to search instead of silently reverting at the next cache rebuild.",
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
    context,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (flatFieldMetadata.isSearchable !== true) {
      return { status: 'noop' };
    }

    // System builds (standard application, upgrade flows) declare their
    // searchFieldMetadata rows explicitly alongside the fields.
    if (context.buildOptions.isSystemBuild) {
      return { status: 'noop' };
    }

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier:
          flatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return buildFieldSideEffectParentNotFoundFailure({
        flatFieldMetadata,
        operation: 'create',
      });
    }

    // The object-create side effect owns the label identifier's row.
    if (
      parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      flatFieldMetadata.universalIdentifier
    ) {
      return { status: 'noop' };
    }

    const pendingFlatSearchFieldMetadatas =
      getPendingFlatSearchFieldMetadataCreatesForObject({
        objectMetadataUniversalIdentifier:
          parentFlatObjectMetadata.universalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
      });

    if (
      pendingFlatSearchFieldMetadatas.some(
        (pendingFlatSearchFieldMetadata) =>
          pendingFlatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
          flatFieldMetadata.universalIdentifier,
      )
    ) {
      return { status: 'noop' };
    }

    const fieldByUniversalIdentifier: Partial<
      Record<string, MetadataUniversalFlatEntity<'fieldMetadata'>>
    > = {};

    for (const fieldUniversalIdentifier of parentFlatObjectMetadata.fieldUniversalIdentifiers) {
      const resolvedFlatFieldMetadata =
        allFlatEntityOperationRecordByMetadataName.fieldMetadata
          ?.flatEntityToCreate[fieldUniversalIdentifier] ??
        relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          fieldUniversalIdentifier
        ];

      if (isDefined(resolvedFlatFieldMetadata)) {
        fieldByUniversalIdentifier[fieldUniversalIdentifier] =
          resolvedFlatFieldMetadata;
      }
    }

    const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers:
        parentFlatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps: {
        byUniversalIdentifier: fieldByUniversalIdentifier,
      },
    });

    if (!isDefined(tsVectorFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const existingSearchFieldMetadatas =
      parentFlatObjectMetadata.searchFieldMetadataUniversalIdentifiers
        .map(
          (searchFieldMetadataUniversalIdentifier) =>
            relatedFlatEntityMaps.flatSearchFieldMetadataMaps
              .byUniversalIdentifier[searchFieldMetadataUniversalIdentifier],
        )
        .filter(isDefined);

    const position =
      [
        ...existingSearchFieldMetadatas,
        ...pendingFlatSearchFieldMetadatas,
      ].reduce(
        (maxPosition, searchFieldMetadata) =>
          Math.max(maxPosition, searchFieldMetadata.position),
        -1,
      ) + 1;

    const searchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata: parentFlatObjectMetadata,
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
