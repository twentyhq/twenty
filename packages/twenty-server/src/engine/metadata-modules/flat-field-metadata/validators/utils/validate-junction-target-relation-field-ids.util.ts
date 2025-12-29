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

type ValidateJunctionTargetRelationFieldIdsArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

export const validateJunctionTargetRelationFieldIds = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: ValidateJunctionTargetRelationFieldIdsArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];
  const settings = flatFieldMetadata.settings;

  const hasFieldIds =
    isDefined(settings.junctionTargetRelationFieldIds) &&
    settings.junctionTargetRelationFieldIds.length > 0;
  const hasMorphId =
    isDefined(settings.junctionMorphId) && settings.junctionMorphId.length > 0;

  // No junction config set - nothing to validate
  if (!hasFieldIds && !hasMorphId) {
    return errors;
  }

  // Validate mutual exclusivity
  if (hasFieldIds && hasMorphId) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message:
        'Cannot set both junctionTargetRelationFieldIds and junctionMorphId',
      userFriendlyMessage: msg`Cannot set both junction field IDs and junction morph ID`,
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

  // Validate junctionMorphId if set
  if (hasMorphId) {
    errors.push(
      ...validateJunctionMorphId({
        flatFieldMetadata,
        flatFieldMetadataMaps,
        junctionMorphId: settings.junctionMorphId!,
      }),
    );
  }

  // Validate junctionTargetRelationFieldIds if set
  if (hasFieldIds) {
    errors.push(
      ...validateJunctionFieldIds({
        flatFieldMetadata,
        flatFieldMetadataMaps,
        junctionTargetRelationFieldIds:
          settings.junctionTargetRelationFieldIds!,
      }),
    );
  }

  return errors;
};

type ValidateJunctionMorphIdArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  junctionMorphId: string;
};

const validateJunctionMorphId = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  junctionMorphId,
}: ValidateJunctionMorphIdArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (!isValidUuid(junctionMorphId)) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Invalid junction morph ID: ${junctionMorphId}`,
      userFriendlyMessage: msg`Invalid junction morph ID`,
      value: junctionMorphId,
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
      field.morphId === junctionMorphId,
  );

  if (morphFieldsOnJunction.length === 0) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `No morph fields found with morphId: ${junctionMorphId} on junction object`,
      userFriendlyMessage: msg`No morph fields found with the specified morph ID`,
      value: junctionMorphId,
    });
  }

  return errors;
};

type ValidateJunctionFieldIdsArgs = {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  junctionTargetRelationFieldIds: string[];
};

const validateJunctionFieldIds = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  junctionTargetRelationFieldIds,
}: ValidateJunctionFieldIdsArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  for (const fieldId of junctionTargetRelationFieldIds) {
    if (!isValidUuid(fieldId)) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Invalid junction target relation field ID: ${fieldId}`,
        userFriendlyMessage: msg`Invalid junction target field ID`,
        value: fieldId,
      });
      continue;
    }

    const targetField = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(targetField)) {
      errors.push({
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: `Junction target relation field not found: ${fieldId}`,
        userFriendlyMessage: msg`Junction target field not found`,
        value: fieldId,
      });
      continue;
    }

    // The target field must be on the junction object (which is the target of this ONE_TO_MANY)
    if (
      targetField.objectMetadataId !==
      flatFieldMetadata.relationTargetObjectMetadataId
    ) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Junction target field ${fieldId} is not on the junction object`,
        userFriendlyMessage: msg`Junction target field must be on the junction object`,
        value: fieldId,
      });
      continue;
    }

    // The target field must be a RELATION or MORPH_RELATION
    if (!isMorphOrRelationFlatFieldMetadata(targetField)) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Junction target field ${fieldId} is not a relation field`,
        userFriendlyMessage: msg`Junction target field must be a relation field`,
        value: fieldId,
      });
      continue;
    }

    // MORPH_RELATION fields are polymorphic and don't require MANY_TO_ONE check
    const isMorphRelation =
      targetField.type === FieldMetadataType.MORPH_RELATION;

    if (!isMorphRelation) {
      // For regular RELATION fields, must be MANY_TO_ONE
      const targetFieldSettings = targetField.settings;

      if (targetFieldSettings.relationType !== RelationType.MANY_TO_ONE) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Junction target field ${fieldId} is not a MANY_TO_ONE relation`,
          userFriendlyMessage: msg`Junction target field must be a MANY_TO_ONE relation`,
          value: fieldId,
        });
      }
    }
  }

  return errors;
};
