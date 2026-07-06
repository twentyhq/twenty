import { Injectable } from '@nestjs/common';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { isFlatEntityAlreadyPresentForSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/object-metadata/utils/is-flat-entity-already-present-for-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectSearchFieldMetadataOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSearchFieldMetadataOnCreate',
    description:
      'When a searchable object is created, generate the searchFieldMetadata row that targets its label identifier field so the searchVector is populated instead of NULL.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    if (flatObjectMetadata.isSearchable !== true) {
      return { status: 'noop' };
    }

    const labelIdentifierFieldMetadataUniversalIdentifier =
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      return { status: 'noop' };
    }

    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: universalIdentifier,
      name: 'id',
    });

    // Junction objects use the id field as their label identifier and never get a
    // searchFieldMetadata row (mirrors the legacy skipNameField behavior).
    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      return { status: 'noop' };
    }

    const labelIdentifierFieldType = this.resolveLabelIdentifierFieldType({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: universalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });

    if (
      !isDefined(labelIdentifierFieldType) ||
      !isSearchableFieldType(labelIdentifierFieldType)
    ) {
      return { status: 'noop' };
    }

    const searchVectorFieldMetadataUniversalIdentifier =
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier: universalIdentifier,
        name: 'searchVector',
      });

    const flatSearchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata,
      flatFieldMetadata: {
        universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      },
      tsVectorFlatFieldMetadata: {
        universalIdentifier: searchVectorFieldMetadataUniversalIdentifier,
      },
      position: 0,
    });

    if (
      isFlatEntityAlreadyPresentForSideEffect({
        metadataName: 'searchFieldMetadata',
        universalIdentifier: flatSearchFieldMetadata.universalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      })
    ) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        searchFieldMetadata: {
          flatEntityToCreate: {
            [flatSearchFieldMetadata.universalIdentifier]:
              flatSearchFieldMetadata,
          },
        },
      },
    };
  }

  // The label identifier is either the derived name field (always TEXT and
  // searchable) or an author-declared field that must be resolved from the
  // pending create matrix or the workspace from-state to read its type.
  private resolveLabelIdentifierFieldType({
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    applicationUniversalIdentifier: string;
    objectUniversalIdentifier: string;
    labelIdentifierFieldMetadataUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): FieldMetadataType | undefined {
    const derivedNameFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier,
      name: 'name',
    });

    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedNameFieldUniversalIdentifier
    ) {
      return FieldMetadataType.TEXT;
    }

    const pendingField =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToCreate[labelIdentifierFieldMetadataUniversalIdentifier];

    if (isDefined(pendingField)) {
      return pendingField.type;
    }

    const existingField =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        labelIdentifierFieldMetadataUniversalIdentifier
      ];

    return existingField?.type;
  }
}
