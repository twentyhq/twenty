import { Injectable } from '@nestjs/common';

import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildSearchVectorFlatFieldMetadataForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-flat-field-metadata-for-custom-object.util';
import { buildSearchVectorGinIndexForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-search-vector-gin-index-for-custom-object.util';
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

    const searchVectorFlatFieldMetadata =
      buildSearchVectorFlatFieldMetadataForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
      });

    const tsVectorFlatIndex = buildSearchVectorGinIndexForCustomObject({
      flatObjectMetadata,
      searchVectorFlatFieldMetadata,
    });

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

    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      name: 'id',
    });

    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      return undefined;
    }

    const labelIdentifierFieldType = this.resolveLabelIdentifierFieldType({
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

  private resolveLabelIdentifierFieldType({
    labelIdentifierFieldMetadataUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    labelIdentifierFieldMetadataUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): FieldMetadataType | undefined {
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
