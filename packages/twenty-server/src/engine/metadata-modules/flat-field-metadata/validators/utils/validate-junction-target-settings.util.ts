import { type MessageDescriptor } from '@lingui/core';
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

  const junctionTargetFieldId = settings.junctionTargetFieldId;

  if (!isDefined(junctionTargetFieldId) || junctionTargetFieldId.length === 0) {
    return [];
  }

  if (settings.relationType !== RelationType.ONE_TO_MANY) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        'Junction configuration can only be set on ONE_TO_MANY relations',
        msg`Junction configuration is only valid for ONE_TO_MANY relations`,
      ),
    ];
  }

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
