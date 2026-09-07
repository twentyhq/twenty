import { msg } from '@lingui/core/macro';
import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isPrimaryKeyFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-primary-key-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const validateSearchableFlatFieldMetadata = ({
  flatFieldMetadataToValidate,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  remainingFlatFieldMetadataMaps,
}: {
  flatFieldMetadataToValidate: UniversalFlatFieldMetadata;
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    | 'isSearchable'
    | 'fieldUniversalIdentifiers'
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
  >;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
  remainingFlatFieldMetadataMaps?: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (flatFieldMetadataToValidate.isSearchable !== true) {
    if (
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
      flatFieldMetadataToValidate.universalIdentifier
    ) {
      errors.push({
        code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        message: 'Label identifier field cannot be removed from search',
        userFriendlyMessage: msg`Label identifier field cannot be removed from search`,
      });
    }

    return errors;
  }

  if (!isSearchableFieldType(flatFieldMetadataToValidate.type)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Field type ${flatFieldMetadataToValidate.type} is not supported for search`,
      userFriendlyMessage: msg`This field type cannot be searched`,
    });
  }

  if (isPrimaryKeyFlatFieldMetadata(flatFieldMetadataToValidate)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Id field is not supported for search',
      userFriendlyMessage: msg`Id field cannot be searched`,
    });
  }

  if (flatObjectMetadata.isSearchable !== true) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      message: 'Object is not searchable',
      userFriendlyMessage: msg`Enable search on this object before adding searchable fields`,
    });

    return errors;
  }

  const tsVectorFlatFieldMetadata =
    findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps,
    }) ??
    remainingFlatFieldMetadataMaps?.byUniversalIdentifier[
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
        name: SEARCH_VECTOR_FIELD.name,
      })
    ];

  if (!isDefined(tsVectorFlatFieldMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
      message: isDefined(remainingFlatFieldMetadataMaps)
        ? 'Object has no search vector field, in both existing and about to be created field metadatas'
        : 'Object has no search vector field',
      userFriendlyMessage: msg`This object has no search vector`,
    });
  }

  return errors;
};
