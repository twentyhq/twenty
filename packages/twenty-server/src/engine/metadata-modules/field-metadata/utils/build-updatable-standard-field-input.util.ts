import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const buildUpdatableStandardFieldInput = (
  fieldMetadataInput: UpdateFieldInput,
  existingFieldMetadata: Pick<
    FieldMetadataEntity,
    'type' | 'isNullable' | 'defaultValue' | 'options'
  >,
) => {
  const updatableStandardFieldInput: UpdateFieldInput & {
    standardOverrides?: FieldStandardOverridesDTO;
  } = {
    id: fieldMetadataInput.id,
    isActive: fieldMetadataInput.isActive,
    workspaceId: fieldMetadataInput.workspaceId,
    defaultValue: fieldMetadataInput.defaultValue,
    settings: fieldMetadataInput.settings,
    isLabelSyncedWithName: fieldMetadataInput.isLabelSyncedWithName,
    isUnique: fieldMetadataInput.isUnique,
  };

  if ('standardOverrides' in fieldMetadataInput) {
    updatableStandardFieldInput.standardOverrides =
      fieldMetadataInput.standardOverrides as FieldStandardOverridesDTO;
  }

  if (
    existingFieldMetadata.type === FieldMetadataType.SELECT ||
    existingFieldMetadata.type === FieldMetadataType.MULTI_SELECT
  ) {
    return {
      ...updatableStandardFieldInput,
      options: fieldMetadataInput.options,
    };
  }

  return updatableStandardFieldInput;
};
