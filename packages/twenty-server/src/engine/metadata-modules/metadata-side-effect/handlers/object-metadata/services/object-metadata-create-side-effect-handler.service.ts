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

// First side-effect handler: when a custom object is created, ensure its searchable
// `name` field has a matching searchFieldMetadata row. This mirrors the API create path
// (build-default-search-field-metadatas-for-custom-object) and the 2-16 backfill rule,
// closing the gap on the manifest/application-sync path where searchFieldMetadata is not
// part of the manifest. Idempotent: it dedupes by the field it points to, against both
// the operation matrix being expanded and the existing workspace state.
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

    // Resolve by exact name (not the label identifier): junction objects have no name
    // field and their label identifier is the UUID id, so they must stay unsearchable.
    const nameFlatFieldMetadata = (
      allFlatEntityOperationByMetadataName.fieldMetadata?.flatEntityToCreate ?? []
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
