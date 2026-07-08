import { Injectable } from '@nestjs/common';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildDefaultFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { buildDefaultIndexesForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-index-for-custom-object.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

@Injectable()
export class ObjectSearchVectorOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSearchVectorOnCreate',
    description:
      'When an object is created, provision its full-text search surface as a single self-contained side effect: the searchVector system field, the GIN index backing it, and (for searchable objects whose label identifier is a searchable field) the searchFieldMetadata row that keeps the searchVector populated instead of NULL.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    const defaultFlatFieldForCustomObjectMaps =
      buildDefaultFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
        skipNameField: true,
      });

    const searchVectorFlatFieldMetadata =
      defaultFlatFieldForCustomObjectMaps.fields.searchVector;

    const { indexes } = buildDefaultIndexesForCustomObject({
      flatObjectMetadata,
      defaultFlatFieldForCustomObjectMaps,
      objectFlatFieldMetadatas: Object.values(
        defaultFlatFieldForCustomObjectMaps.fields,
      ),
    });

    const tsVectorFlatIndex = indexes.tsVectorFlatIndex;

    // The searchVector field and its GIN index are pure engine output with
    // deterministic isSystemSideEffect universal identifiers, so the engine merge
    // dedups them silently if they are also declared elsewhere; no local presence
    // check is needed. They are always provisioned, even for non-searchable
    // objects, so the column and its index exist consistently.
    const operations: MetadataSideEffectOperationsByMetadataName = {
      fieldMetadata: {
        flatEntityToCreate: {
          [searchVectorFlatFieldMetadata.universalIdentifier]:
            searchVectorFlatFieldMetadata,
        },
      },
      index: {
        flatEntityToCreate: {
          [tsVectorFlatIndex.universalIdentifier]: tsVectorFlatIndex,
        },
      },
    };

    const searchFieldMetadata = this.buildSearchFieldMetadata({
      flatObjectMetadata,
      searchVectorFlatFieldMetadata,
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
    });

    if (isDefined(searchFieldMetadata)) {
      operations.searchFieldMetadata = {
        flatEntityToCreate: {
          [searchFieldMetadata.universalIdentifier]: searchFieldMetadata,
        },
      };
    }

    return {
      status: 'success',
      operations,
    };
  }

  // The searchFieldMetadata targets the object's label identifier so the
  // searchVector is populated. It is only provisioned for searchable objects
  // whose label identifier is a searchable-type field. Junction objects use the
  // id field as their label identifier and never get a searchFieldMetadata row.
  private buildSearchFieldMetadata({
    flatObjectMetadata,
    searchVectorFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    flatObjectMetadata: BuildSideEffectsArgs<'objectMetadata'>['flatEntity'];
    searchVectorFlatFieldMetadata: { universalIdentifier: string };
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): UniversalFlatSearchFieldMetadata | undefined {
    if (flatObjectMetadata.isSearchable !== true) {
      return undefined;
    }

    const labelIdentifierFieldMetadataUniversalIdentifier =
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      return undefined;
    }

    const { applicationUniversalIdentifier, universalIdentifier } =
      flatObjectMetadata;

    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: universalIdentifier,
      name: 'id',
    });

    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      return undefined;
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
      return undefined;
    }

    return buildFlatSearchFieldMetadataForField({
      flatObjectMetadata,
      flatFieldMetadata: {
        universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      },
      tsVectorFlatFieldMetadata: {
        universalIdentifier: searchVectorFlatFieldMetadata.universalIdentifier,
      },
      position: 0,
    });
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
