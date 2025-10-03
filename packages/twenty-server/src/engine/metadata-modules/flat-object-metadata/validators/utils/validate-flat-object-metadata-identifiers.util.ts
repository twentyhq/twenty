import { t } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

export const validateFlatObjectMetadataIdentifiers = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'labelIdentifierFieldMetadataId' | 'imageIdentifierFieldMetadataId'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  const errors: FlatObjectMetadataValidationError[] = [];

  const { labelIdentifierFieldMetadataId, imageIdentifierFieldMetadataId } =
    flatObjectMetadata;

  // TODO should not be nullable
  if (isDefined(labelIdentifierFieldMetadataId)) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: labelIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as label identifier not found`,
        value: labelIdentifierFieldMetadataId,
      });
    } else if (!isLabelIdentifierFieldMetadataTypes(flatFieldMetadata.type)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataId validation failed: field type not compatible',
        userFriendlyMessage: t`Field cannot be used as label identifier`,
        value: labelIdentifierFieldMetadataId,
      });
    }
  }

  if (isDefined(imageIdentifierFieldMetadataId)) {
    const relatedFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: imageIdentifierFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(relatedFlatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'imageIdentifierFieldMetadataId validation failed: related field metadata not found',
        userFriendlyMessage: t`Field declared as image identifier not found`,
        value: relatedFlatFieldMetadata,
      });
    }
  }

  return errors;
};
