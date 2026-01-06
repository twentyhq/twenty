import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

type ValidateJunctionTargetSettingsArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

export const validateJunctionTargetSettings = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: ValidateJunctionTargetSettingsArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const settings = flatFieldMetadata.settings;

  const hasFieldId =
    isDefined(settings.junctionTargetFieldId) &&
    settings.junctionTargetFieldId.length > 0;
  const hasMorphId =
    isDefined(settings.junctionTargetMorphId) &&
    settings.junctionTargetMorphId.length > 0;

  // No junction config set - nothing to validate
  if (!hasFieldId && !hasMorphId) {
    return errors;
  }

  // Validate mutual exclusivity
  if (hasFieldId && hasMorphId) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message:
        'Cannot set both junctionTargetFieldId and junctionTargetMorphId',
      userFriendlyMessage: msg`Cannot set both junction target field ID and junction target morph ID`,
    });

    return errors;
  }

  // Junction config should only be set on ONE_TO_MANY relations
  if (settings.relationType !== RelationType.ONE_TO_MANY) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message:
        'Junction configuration can only be set on ONE_TO_MANY relations',
      userFriendlyMessage: msg`Junction configuration is only valid for ONE_TO_MANY relations`,
    });

    return errors;
  }

  // Validate junctionTargetMorphId if set
  if (hasMorphId) {
    errors.push(
      ...validateJunctionTargetMorphId({
        flatFieldMetadata,
        flatFieldMetadataMaps,
        junctionTargetMorphId: settings.junctionTargetMorphId!,
      }),
    );
  }

  // Validate junctionTargetFieldId if set
  if (hasFieldId) {
    errors.push(
      ...validateJunctionTargetFieldId({
        flatFieldMetadata,
        flatFieldMetadataMaps,
        junctionTargetFieldId: settings.junctionTargetFieldId!,
      }),
    );
  }

  return errors;
};

type ValidateJunctionTargetMorphIdArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  junctionTargetMorphId: string;
};

const validateJunctionTargetMorphId = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  junctionTargetMorphId,
}: ValidateJunctionTargetMorphIdArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isValidUuid(junctionTargetMorphId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid junction target morph ID: ${junctionTargetMorphId}`,
      userFriendlyMessage: msg`Invalid junction target morph ID`,
      value: junctionTargetMorphId,
    });

    return errors;
  }

  // Find morph fields with this morphId on the junction object
  const junctionObjectId = flatFieldMetadata.relationTargetObjectMetadataId;
  const morphFieldsOnJunction = Object.values(
    flatFieldMetadataMaps.byId,
  ).filter(
    (field) =>
      isDefined(field) &&
      field.objectMetadataId === junctionObjectId &&
      field.morphId === junctionTargetMorphId,
  );

  if (morphFieldsOnJunction.length === 0) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `No morph fields found with morphId: ${junctionTargetMorphId} on junction object`,
      userFriendlyMessage: msg`No morph fields found with the specified morph ID`,
      value: junctionTargetMorphId,
    });
  }

  return errors;
};

type ValidateJunctionTargetFieldIdArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  junctionTargetFieldId: string;
};

const validateJunctionTargetFieldId = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  junctionTargetFieldId,
}: ValidateJunctionTargetFieldIdArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isValidUuid(junctionTargetFieldId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid junction target field ID: ${junctionTargetFieldId}`,
      userFriendlyMessage: msg`Invalid junction target field ID`,
      value: junctionTargetFieldId,
    });

    return errors;
  }

  const targetField = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
    flatEntityId: junctionTargetFieldId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(targetField)) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: `Junction target field not found: ${junctionTargetFieldId}`,
      userFriendlyMessage: msg`Junction target field not found`,
      value: junctionTargetFieldId,
    });

    return errors;
  }

  // The target field must be on the junction object (which is the target of this ONE_TO_MANY)
  if (
    targetField.objectMetadataId !==
    flatFieldMetadata.relationTargetObjectMetadataId
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Junction target field ${junctionTargetFieldId} is not on the junction object`,
      userFriendlyMessage: msg`Junction target field must be on the junction object`,
      value: junctionTargetFieldId,
    });

    return errors;
  }

  // The target field must be a RELATION or MORPH_RELATION
  if (!isMorphOrRelationFlatFieldMetadata(targetField)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Junction target field ${junctionTargetFieldId} is not a relation field`,
      userFriendlyMessage: msg`Junction target field must be a relation field`,
      value: junctionTargetFieldId,
    });

    return errors;
  }

  // MORPH_RELATION fields are polymorphic and don't require MANY_TO_ONE check
  const isMorphRelation = targetField.type === FieldMetadataType.MORPH_RELATION;

  if (!isMorphRelation) {
    // For regular RELATION fields, must be MANY_TO_ONE
    const targetFieldSettings = targetField.settings;

    if (targetFieldSettings.relationType !== RelationType.MANY_TO_ONE) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Junction target field ${junctionTargetFieldId} is not a MANY_TO_ONE relation`,
        userFriendlyMessage: msg`Junction target field must be a MANY_TO_ONE relation`,
        value: junctionTargetFieldId,
      });
    }
  }

  return errors;
};
