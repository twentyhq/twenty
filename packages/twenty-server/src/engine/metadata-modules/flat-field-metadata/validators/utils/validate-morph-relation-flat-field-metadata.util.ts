import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { validateMorphOrRelationFlatFieldOnDelete } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-on-delete.util';
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

  if (isMorphRelationGroup(universalFlatFieldMetadataToValidate)) {
    if (
      isDefined(
        universalFlatFieldMetadataToValidate.relationTargetFieldMetadataUniversalIdentifier,
      ) ||
      isDefined(
        universalFlatFieldMetadataToValidate.relationTargetObjectMetadataUniversalIdentifier,
      ) ||
      isDefined(
        universalFlatFieldMetadataToValidate.universalSettings?.joinColumnName,
      ) ||
      ![RelationType.MANY_TO_ONE, RelationType.ONE_TO_MANY].includes(
        universalFlatFieldMetadataToValidate.universalSettings?.relationType,
      )
    ) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message:
          'A morph group must define a relation type without a physical target or join column',
        userFriendlyMessage: msg`Invalid morph relation field`,
      });
    }
    errors.push(
      ...validateMorphOrRelationFlatFieldOnDelete({
        universalFlatFieldMetadata: universalFlatFieldMetadataToValidate,
      }),
    );
    const previousField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        universalFlatFieldMetadataToValidate.universalIdentifier
      ];
    if (
      isDefined(args.update) &&
      isDefined(previousField) &&
      isFlatFieldMetadataOfType(
        previousField,
        FieldMetadataType.MORPH_RELATION,
      ) &&
      previousField.universalSettings.relationType !==
        universalFlatFieldMetadataToValidate.universalSettings.relationType
    ) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: 'Morph relation cardinality cannot be changed',
        userFriendlyMessage: msg`Relation type cannot be changed`,
      });
    }
    return errors;
  }

  const group =
    remainingFlatEntityMapsToValidate?.byUniversalIdentifier[
      universalFlatFieldMetadataToValidate.morphId
    ] ??
    flatFieldMetadataMaps.byUniversalIdentifier[
      universalFlatFieldMetadataToValidate.morphId
    ];

  if (
    !isDefined(group) ||
    !isMorphRelationGroup(group) ||
    group.objectMetadataUniversalIdentifier !==
      universalFlatFieldMetadataToValidate.objectMetadataUniversalIdentifier ||
    (isFlatFieldMetadataOfType(group, FieldMetadataType.MORPH_RELATION) &&
      group.universalSettings.relationType !==
        universalFlatFieldMetadataToValidate.universalSettings.relationType)
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message:
        'Morph target must belong to a persisted morph field on the same object',
      userFriendlyMessage: msg`Morph relation field not found`,
    });
  }

  errors.push(...validateMorphOrRelationFlatFieldMetadata(args));

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) return errors;

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
