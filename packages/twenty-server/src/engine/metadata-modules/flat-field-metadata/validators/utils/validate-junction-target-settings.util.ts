import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type ValidateJunctionTargetSettingsArgs = {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
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
  universalFlatFieldMetadata,
  flatFieldMetadataMaps,
}: ValidateJunctionTargetSettingsArgs): FlatFieldMetadataValidationError[] => {
  const { universalSettings } = universalFlatFieldMetadata;

  const junctionTargetFieldUniversalIdentifier =
    universalSettings.junctionTargetFieldUniversalIdentifier;

  if (
    !isDefined(junctionTargetFieldUniversalIdentifier) ||
    junctionTargetFieldUniversalIdentifier.length === 0
  ) {
    return [];
  }

  if (universalSettings.relationType !== RelationType.ONE_TO_MANY) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        'Junction configuration can only be set on ONE_TO_MANY relations',
        msg`Junction configuration is only valid for ONE_TO_MANY relations`,
      ),
    ];
  }

  const targetField = findFlatEntityByUniversalIdentifier({
    universalIdentifier: junctionTargetFieldUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(targetField)) {
    return [
      createError(
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        `Junction target field not found: ${junctionTargetFieldUniversalIdentifier}`,
        msg`Junction target field not found`,
        junctionTargetFieldUniversalIdentifier,
      ),
    ];
  }

  if (
    targetField.objectMetadataUniversalIdentifier !==
    universalFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
  ) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldUniversalIdentifier} is not on the junction object`,
        msg`Junction target field must be on the junction object`,
        junctionTargetFieldUniversalIdentifier,
      ),
    ];
  }

  if (!isMorphOrRelationUniversalFlatFieldMetadata(targetField)) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldUniversalIdentifier} is not a relation field`,
        msg`Junction target field must be a relation field`,
        junctionTargetFieldUniversalIdentifier,
      ),
    ];
  }

  // MORPH_RELATION fields are polymorphic and don't require MANY_TO_ONE check
  if (targetField.type === FieldMetadataType.MORPH_RELATION) {
    return [];
  }

  if (targetField.universalSettings.relationType !== RelationType.MANY_TO_ONE) {
    return [
      createError(
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        `Junction target field ${junctionTargetFieldUniversalIdentifier} is not a MANY_TO_ONE relation`,
        msg`Junction target field must be a MANY_TO_ONE relation`,
        junctionTargetFieldUniversalIdentifier,
      ),
    ];
  }

  return [];
};
