import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { buildSearchVectorFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-flat-field-metadata-for-custom-object.util';
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

    const parentIsPendingCreate = isDefined(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToCreate[parentFlatObjectMetadata.universalIdentifier],
    );

    // When the object is created in the same batch, the object-create side
    // effect provisions its searchVector field, but handler ordering within
    // the batch is unspecified: that pending create may not be visible here
    // yet. Its universal identifier is deterministic, so reference it instead
    // of losing the row to the race (it no-ops into the same field once both
    // operations land).
    const tsVectorFieldMetadataUniversalIdentifier =
      findTsVectorFlatFieldMetadataForObject({
        fieldUniversalIdentifiers:
          parentFlatObjectMetadata.fieldUniversalIdentifiers,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: fieldByUniversalIdentifier,
        },
      })?.universalIdentifier ??
      (parentIsPendingCreate && parentFlatObjectMetadata.isSearchable === true
        ? buildSearchVectorFlatFieldMetadataForCustomObject({
            flatObjectMetadata: {
              applicationUniversalIdentifier:
                parentFlatObjectMetadata.applicationUniversalIdentifier,
              universalIdentifier: parentFlatObjectMetadata.universalIdentifier,
            },
          }).universalIdentifier
        : undefined);

    if (!isDefined(tsVectorFieldMetadataUniversalIdentifier)) {
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

    // Same-batch object creation may still owe the label identifier its row
    // (position 0, created by the object-create side effect); leave that slot
    // free when it has not been accumulated yet.
    const labelIdentifierRowIsStillPending =
      parentIsPendingCreate &&
      isDefined(
        parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      ) &&
      !pendingFlatSearchFieldMetadatas.some(
        (pendingFlatSearchFieldMetadata) =>
          pendingFlatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
          parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      );

    const position =
      [
        ...existingSearchFieldMetadatas,
        ...pendingFlatSearchFieldMetadatas,
      ].reduce(
        (maxPosition, searchFieldMetadata) =>
          Math.max(maxPosition, searchFieldMetadata.position),
        labelIdentifierRowIsStillPending ? 0 : -1,
      ) + 1;

    // isSystemSideEffect: true (the util's default): the row is the engine's
    // backing materialization of the field-level flag, like the unique
    // backing index. A false here would let the app-sync deletion sweep
    // collect the row on the next sync, since manifests declare the flag,
    // not the row.
    const searchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata: parentFlatObjectMetadata,
      flatFieldMetadata: {
        universalIdentifier: flatFieldMetadata.universalIdentifier,
      },
      tsVectorFlatFieldMetadata: {
        universalIdentifier: tsVectorFieldMetadataUniversalIdentifier,
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
