import { Injectable } from '@nestjs/common';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectSearchVectorOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectSearchVectorOnUpdate',
    description:
      'When a searchable object is relabeled onto a new searchable field, provision the searchFieldMetadata row that indexes it. Relabeling is additive: existing search rows (e.g. the provisioned name row) are preserved so the previous label identifier stays searchable. Mirrors the API update path so a manifest re-sync that changes the label identifier reaches search parity.',
  },
) {
  buildSideEffects({
    flatEntity: updatedFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    if (updatedFlatObjectMetadata.isSearchable !== true) {
      return { status: 'noop' };
    }

    const newLabelIdentifierFieldMetadataUniversalIdentifier =
      updatedFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (!isDefined(newLabelIdentifierFieldMetadataUniversalIdentifier)) {
      return { status: 'noop' };
    }

    // The trigger entity is the incoming (manifest/API) object with empty foreign
    // key aggregators; the existing search rows, positions and searchVector field
    // are resolved from the current cached object.
    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        updatedFlatObjectMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return { status: 'noop' };
    }

    if (
      existingFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      newLabelIdentifierFieldMetadataUniversalIdentifier
    ) {
      return { status: 'noop' };
    }

    // Junction objects use the system id field as label identifier; UUID is a
    // searchable type, so a type-based check would wrongly index them.
    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier:
        updatedFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
      name: 'id',
    });

    if (
      newLabelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      return { status: 'noop' };
    }

    const newLabelIdentifierFieldType = this.resolveFieldType({
      fieldMetadataUniversalIdentifier:
        newLabelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });

    if (
      !isDefined(newLabelIdentifierFieldType) ||
      !isSearchableFieldType(newLabelIdentifierFieldType)
    ) {
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

    const newLabelIdentifierAlreadyIndexed = existingSearchFieldMetadatas.some(
      (searchFieldMetadata) =>
        searchFieldMetadata.fieldMetadataUniversalIdentifier ===
        newLabelIdentifierFieldMetadataUniversalIdentifier,
    );

    if (newLabelIdentifierAlreadyIndexed) {
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

    const newLabelIdentifierPosition =
      existingSearchFieldMetadatas.reduce(
        (maxPosition, searchFieldMetadata) =>
          Math.max(maxPosition, searchFieldMetadata.position),
        -1,
      ) + 1;

    const searchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata: updatedFlatObjectMetadata,
      flatFieldMetadata: {
        universalIdentifier: newLabelIdentifierFieldMetadataUniversalIdentifier,
      },
      tsVectorFlatFieldMetadata: {
        universalIdentifier: tsVectorFlatFieldMetadata.universalIdentifier,
      },
      position: newLabelIdentifierPosition,
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

  private resolveFieldType({
    fieldMetadataUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    fieldMetadataUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): FieldMetadataType | undefined {
    const pendingField =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToCreate[fieldMetadataUniversalIdentifier];

    if (isDefined(pendingField)) {
      return pendingField.type;
    }

    const existingField =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        fieldMetadataUniversalIdentifier
      ];

    return existingField?.type;
  }
}
