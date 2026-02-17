import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';

export const validateMorphRelationFlatFieldMetadata = (
  args: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.MORPH_RELATION>,
): FlatFieldMetadataValidationError[] => {
  const {
    flatEntityToValidate: universalFlatFieldMetadataToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatFieldMetadataMaps },
    remainingFlatEntityMapsToValidate,
  } = args;
  const { relationTargetFieldMetadataUniversalIdentifier } =
    universalFlatFieldMetadataToValidate;

  const errors: FlatFieldMetadataValidationError[] = [];

  errors.push(...validateMorphOrRelationFlatFieldMetadata(args));

  const targetUniversalFlatFieldMetadata =
    (remainingFlatEntityMapsToValidate
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
          flatEntityMaps: remainingFlatEntityMapsToValidate,
        })
      : undefined) ??
    findFlatEntityByUniversalIdentifier({
      universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  if (
    isDefined(targetUniversalFlatFieldMetadata) &&
    !isFlatFieldMetadataOfType(
      targetUniversalFlatFieldMetadata,
      FieldMetadataType.RELATION,
    )
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'A morph relation field can only target a RELATION field',
      userFriendlyMessage: msg`Invalid relation field target`,
    });
  }

  const sourceObjectMetadataUniversalIdentifier =
    universalFlatFieldMetadataToValidate.objectMetadataUniversalIdentifier;
  const targetObjectMetadataUniversalIdentifier =
    universalFlatFieldMetadataToValidate.relationTargetObjectMetadataUniversalIdentifier;

  if (
    sourceObjectMetadataUniversalIdentifier ===
    targetObjectMetadataUniversalIdentifier
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Source object cannot be the target object',
      userFriendlyMessage: msg`Source object cannot be the target object`,
    });
  }

  if (!isDefined(universalFlatFieldMetadataToValidate.morphId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Morph relation field must have a morph id',
      userFriendlyMessage: msg`Morph relation field must have a morph id`,
    });
  }

  return errors;
};
