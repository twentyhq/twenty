import { Injectable } from '@nestjs/common';

import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';

@Injectable()
export class ObjectMetadataCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  'create',
  'objectMetadata',
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationByMetadataName,
    context,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectOperationsByMetadataName {
    if (!flatObjectMetadata.isSearchable) {
      return {};
    }

    const nameFlatFieldMetadata = (
      allFlatEntityOperationByMetadataName.fieldMetadata?.flatEntityToCreate ??
      []
    ).find(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier &&
        flatFieldMetadata.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
    );

    if (
      !isDefined(nameFlatFieldMetadata) ||
      !isSearchableFieldType(nameFlatFieldMetadata.type)
    ) {
      return {};
    }

    const isAlreadyPlannedInMatrix = (
      allFlatEntityOperationByMetadataName.searchFieldMetadata
        ?.flatEntityToCreate ?? []
    ).some(
      (flatSearchFieldMetadata) =>
        flatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
        nameFlatFieldMetadata.universalIdentifier,
    );

    const existingFlatSearchFieldMetadataByUniversalIdentifier =
      context.existingAllFlatEntityMaps?.flatSearchFieldMetadataMaps
        ?.byUniversalIdentifier ?? {};

    const alreadyExistsInWorkspace = Object.values(
      existingFlatSearchFieldMetadataByUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (flatSearchFieldMetadata) =>
          flatSearchFieldMetadata.fieldMetadataUniversalIdentifier ===
          nameFlatFieldMetadata.universalIdentifier,
      );

    if (isAlreadyPlannedInMatrix || alreadyExistsInWorkspace) {
      return {};
    }

    const flatSearchFieldMetadata = buildFlatSearchFieldMetadataForField({
      flatObjectMetadata,
      flatFieldMetadata: nameFlatFieldMetadata,
      position: 0,
    });

    return {
      searchFieldMetadata: {
        flatEntityToCreate: [
          {
            ...flatSearchFieldMetadata,
            universalIdentifier: getSearchFieldUniversalIdentifier({
              applicationUniversalIdentifier:
                flatObjectMetadata.applicationUniversalIdentifier,
              fieldMetadataUniversalIdentifier:
                nameFlatFieldMetadata.universalIdentifier,
            }),
          },
        ],
      },
    };
  }
}
