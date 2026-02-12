import { msg } from '@lingui/core/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const validateMorphOrRelationFlatFieldOnDelete = ({
  universalFlatFieldMetadata,
}: {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType>;
}): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (
    isDefined(universalFlatFieldMetadata.universalSettings.onDelete) &&
    universalFlatFieldMetadata.universalSettings.relationType !==
      RelationType.MANY_TO_ONE
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'On delete action is only supported for many to one relations',
      userFriendlyMessage: msg`On delete action is only supported for many to one relations`,
    });
  }

  return errors;
};
