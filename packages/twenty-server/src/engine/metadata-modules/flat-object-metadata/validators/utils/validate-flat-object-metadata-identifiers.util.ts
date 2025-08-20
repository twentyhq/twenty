import { t } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const validateFlatObjectMetadataIdentifiers = (
  flatObjectMetadata: FlatObjectMetadata,
) => {
  const errors: FlatObjectMetadataValidationError[] = [];

  const { labelIdentifierFieldMetadataId, imageIdentifierFieldMetadataId } =
    flatObjectMetadata;

  if (isDefined(labelIdentifierFieldMetadataId)) {
    const flatFieldMetadata = flatObjectMetadata.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === labelIdentifierFieldMetadataId,
    );

    if (!isDefined(flatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as label identifier not found`,
      });
    } else if (!isLabelIdentifierFieldMetadataTypes(flatFieldMetadata.type)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataId validation failed: field type not compatible',
        userFriendlyMessage: t`Field cannot be used as label identifier`,
      });
    }
  }

  if (isDefined(imageIdentifierFieldMetadataId)) {
    const relatedFlatFieldMetadata = flatObjectMetadata.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === imageIdentifierFieldMetadataId,
    );

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'imageIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as image identifier not found`,
      });
    }
  }

  return errors;
};
