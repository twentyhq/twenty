import { msg, type MessageDescriptor } from '@lingui/core/macro';
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

// Helper to create a validation error
const createError = (
  code: FieldMetadataExceptionCode,
  message: string,
  userFriendlyMessage: MessageDescriptor,
  value?: string,
): FlatFieldMetadataValidationError => ({
  code,
  message,
  userFriendlyMessage,
  ...(value !== undefined && { value }),
});

export const validateJunctionTargetSettings = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: ValidateJunctionTargetSettingsArgs): FlatFieldMetadataValidationError[] => {
  const { settings } = flatFieldMetadata;

  const hasFieldId =
    isDefined(settings.junctionTargetFieldId) &&
    settings.junctionTargetFieldId.length > 0;
  const hasMorphId =
    isDefined(settings.junctionTargetMorphId) &&
    settings.junctionTargetMorphId.length > 0;

  // No junction config set - nothing to validate
  if (!hasFieldId && !hasMorphId) {
    return [];
  }

  // Validate mutual exclusivity
  if (hasFieldId && hasMorphId) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        'Cannot set both junctionTargetFieldId and junctionTargetMorphId',
        msg`Cannot set both junction target field ID and junction target morph ID`,
      ),
    ];
  }

  // Junction config should only be set on ONE_TO_MANY relations
  if (settings.relationType !== RelationType.ONE_TO_MANY) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        'Junction configuration can only be set on ONE_TO_MANY relations',
        msg`Junction configuration is only valid for ONE_TO_MANY relations`,
      ),
    ];
  }

  // Validate the specific junction target type
  if (hasMorphId) {
    return validateJunctionTargetMorphId(
      flatFieldMetadata,
      flatFieldMetadataMaps,
      settings.junctionTargetMorphId!,
    );
  }

  return validateJunctionTargetFieldId(
    flatFieldMetadata,
    flatFieldMetadataMaps,
    settings.junctionTargetFieldId!,
  );
};

const validateJunctionTargetMorphId = (
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  junctionTargetMorphId: string,
): FlatFieldMetadataValidationError[] => {
  if (!isValidUuid(junctionTargetMorphId)) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Invalid junction target morph ID: ${junctionTargetMorphId}`,
        msg`Invalid junction target morph ID`,
        junctionTargetMorphId,
      ),
    ];
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
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `No morph fields found with morphId: ${junctionTargetMorphId} on junction object`,
        msg`No morph fields found with the specified morph ID`,
        junctionTargetMorphId,
      ),
    ];
  }

  return [];
};

const validateJunctionTargetFieldId = (
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  junctionTargetFieldId: string,
): FlatFieldMetadataValidationError[] => {
  if (!isValidUuid(junctionTargetFieldId)) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Invalid junction target field ID: ${junctionTargetFieldId}`,
        msg`Invalid junction target field ID`,
        junctionTargetFieldId,
      ),
    ];
  }

  const targetField = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
    flatEntityId: junctionTargetFieldId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(targetField)) {
    return [
      createError(
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        `Junction target field not found: ${junctionTargetFieldId}`,
        msg`Junction target field not found`,
        junctionTargetFieldId,
      ),
    ];
  }

  // The target field must be on the junction object
  if (
    targetField.objectMetadataId !==
    flatFieldMetadata.relationTargetObjectMetadataId
  ) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldId} is not on the junction object`,
        msg`Junction target field must be on the junction object`,
        junctionTargetFieldId,
      ),
    ];
  }

  // The target field must be a RELATION or MORPH_RELATION
  if (!isMorphOrRelationFlatFieldMetadata(targetField)) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldId} is not a relation field`,
        msg`Junction target field must be a relation field`,
        junctionTargetFieldId,
      ),
    ];
  }

  // MORPH_RELATION fields are polymorphic and don't require MANY_TO_ONE check
  if (targetField.type === FieldMetadataType.MORPH_RELATION) {
    return [];
  }

  // For regular RELATION fields, must be MANY_TO_ONE
  if (targetField.settings.relationType !== RelationType.MANY_TO_ONE) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldId} is not a MANY_TO_ONE relation`,
        msg`Junction target field must be a MANY_TO_ONE relation`,
        junctionTargetFieldId,
      ),
    ];
  }

  return [];
};
