import { t } from '@lingui/core/macro';
import {
    isDefined,
    isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { type FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
    ObjectMetadataExceptionCode
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const validateFlatObjectMetadataIdentifiers = (
  flatObjectMetadata: FlatObjectMetadata,
) => {
  const errors: FailedFlatObjectMetadataValidation[] = [];

  const { labelIdentifierFieldMetadataId, imageIdentifierFieldMetadataId } =
    flatObjectMetadata;

  if (isDefined(labelIdentifierFieldMetadataId)) {
    const flatFieldMetadata = flatObjectMetadata.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === labelIdentifierFieldMetadataId,
    );

    if (!isDefined(flatFieldMetadata)) {
      errors.push({
        error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: 'labelIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as label identifier not found`,
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        namePlural: flatObjectMetadata.namePlural,
      });
    } else if (!isLabelIdentifierFieldMetadataTypes(flatFieldMetadata.type)) {
      errors.push({
        error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: 'labelIdentifierFieldMetadataId validation failed: field type not compatible',
        userFriendlyMessage: t`Field cannot be used as label identifier`,
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        namePlural: flatObjectMetadata.namePlural,
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
        error: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: 'imageIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as image identifier not found`,
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        namePlural: flatObjectMetadata.namePlural,
      });
    }
  }

  return errors;
};
