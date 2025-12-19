import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';

export const validateMorphRelationFlatFieldMetadata = (
  args: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.MORPH_RELATION>,
): FlatFieldMetadataValidationError[] => {
  const {
    flatEntityToValidate: flatFieldMetadataToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatFieldMetadataMaps },
    remainingFlatEntityMapsToValidate,
  } = args;
  const { relationTargetFieldMetadataId } = flatFieldMetadataToValidate;

  const errors: FlatFieldMetadataValidationError[] = [];

  errors.push(...validateMorphOrRelationFlatFieldMetadata(args));

  const targetFlatFieldMetadata =
    remainingFlatEntityMapsToValidate?.byId[relationTargetFieldMetadataId] ??
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  if (
    isDefined(targetFlatFieldMetadata) &&
    !isFlatFieldMetadataOfType(
      targetFlatFieldMetadata,
      FieldMetadataType.RELATION,
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A morph relation field can only target a RELATION field',
      userFriendlyMessage: msg`Invalid relation field target`,
    });
  }

  const sourceObjectMetadataId = flatFieldMetadataToValidate.objectMetadataId;
  const targetObjectMetadataId =
    flatFieldMetadataToValidate.relationTargetObjectMetadataId;

  if (sourceObjectMetadataId === targetObjectMetadataId) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Source object cannot be the target object',
      userFriendlyMessage: msg`Source object cannot be the target object`,
    });
  }

  if (!isDefined(flatFieldMetadataToValidate.morphId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Morph relation field must have a morph id',
      userFriendlyMessage: msg`Morph relation field must have a morph id`,
    });
  }

  return errors;
};
