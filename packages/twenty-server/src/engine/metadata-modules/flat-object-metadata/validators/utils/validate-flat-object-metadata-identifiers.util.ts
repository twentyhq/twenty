import { msg } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const validateFlatObjectMetadataIdentifiers = ({
  universalFlatObjectMetadata,
  universalFlatFieldMetadataMaps,
}: {
  universalFlatObjectMetadata: Pick<
    UniversalFlatObjectMetadata,
    | 'labelIdentifierFieldMetadataUniversalIdentifier'
    | 'imageIdentifierFieldMetadataUniversalIdentifier'
  >;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}) => {
  const errors: FlatObjectMetadataValidationError[] = [];

  const {
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
  } = universalFlatObjectMetadata;

  // TODO should not be nullable
  if (isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
    const universalFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      flatEntityMaps: universalFlatFieldMetadataMaps,
    });

    if (!isDefined(universalFlatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataUniversalIdentifier validation failed: related field metadata not found',
        userFriendlyMessage: msg`Field declared as label identifier not found`,
      });
    } else if (
      !isLabelIdentifierFieldMetadataTypes(universalFlatFieldMetadata.type)
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'labelIdentifierFieldMetadataUniversalIdentifier validation failed: field type not compatible',
        userFriendlyMessage: msg`Field cannot be used as label identifier`,
      });
    }
  }

  if (isDefined(imageIdentifierFieldMetadataUniversalIdentifier)) {
    const relatedUniversalFlatFieldMetadata =
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: imageIdentifierFieldMetadataUniversalIdentifier,
        flatEntityMaps: universalFlatFieldMetadataMaps,
      });

    if (!isDefined(relatedUniversalFlatFieldMetadata)) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message:
          'imageIdentifierFieldMetadataUniversalIdentifier validation failed: related field metadata not found',
        userFriendlyMessage: msg`Field declared as image identifier not found`,
      });
    }
  }

  return errors;
};
