import { msg } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export const validateFlatObjectMetadataIdentifiers = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  buildOptions,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'labelIdentifierFieldMetadataId' | 'imageIdentifierFieldMetadataId'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  buildOptions: WorkspaceMigrationBuilderOptions;
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
        userFriendlyMessage: msg`Field declared as label identifier not found`,
      });
    } else {
      if (!isLabelIdentifierFieldMetadataTypes(flatFieldMetadata.type)) {
        errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message:
            'labelIdentifierFieldMetadataId validation failed: field type not compatible',
          userFriendlyMessage: msg`Field cannot be used as label identifier`,
        });
      }

      if (
        !buildOptions.isSystemBuild &&
        isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.UUID)
      ) {
        errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message:
            'labelIdentifierFieldMetadataId validation failed: field type uuid is reserved for system object metadata',
          userFriendlyMessage: msg`Field cannot be used as label identifier`,
        });
      }
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
        userFriendlyMessage: msg`Field declared as image identifier not found`,
      });
    }
  }

  return errors;
};
