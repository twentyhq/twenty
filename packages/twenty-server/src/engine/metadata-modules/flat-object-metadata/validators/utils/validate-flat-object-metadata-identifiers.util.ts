import { t } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const validateFlatObjectMetadataIdentifiers = (
  flatObjectMetadata: FlatObjectMetadata,
) => {
  const errors: ObjectMetadataException[] = [];

  const { labelIdentifierFieldMetadataId, imageIdentifierFieldMetadataId } =
    flatObjectMetadata;

  if (isDefined(labelIdentifierFieldMetadataId)) {
    const relatedFlatFieldMetadata = flatObjectMetadata.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === labelIdentifierFieldMetadataId,
    );

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push(
        new ObjectMetadataException(
          'labelIdentifierFieldMetadataId validation failed: related field metadata not found',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          {
            userFriendlyMessage: t`Field declared as label identifier not found`,
          },
        ),
      );
    } else if (
      !isLabelIdentifierFieldMetadataTypes(relatedFlatFieldMetadata.type)
    ) {
      errors.push(
        new ObjectMetadataException(
          'labelIdentifierFieldMetadataId validation failed: field type not compatible',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          {
            userFriendlyMessage: t`Field cannot be used as label identifier`,
          },
        ),
      );
    }
  }

  if (isDefined(imageIdentifierFieldMetadataId)) {
    const relatedFlatFieldMetadata = flatObjectMetadata.flatFieldMetadatas.find(
      (flatFieldMetadata) =>
        flatFieldMetadata.id === imageIdentifierFieldMetadataId,
    );

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push(
        new ObjectMetadataException(
          'imageIdentifierFieldMetadataId validation failed: related field metadata not found',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          {
            userFriendlyMessage: t`Field declared as image identifier not found`,
          },
        ),
      );
    }
  }

  return errors;
};
