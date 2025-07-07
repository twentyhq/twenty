import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

export const buildUpdatableStandardFieldInput = (
  fieldMetadataInput: UpdateFieldInput,
  existingFieldMetadata: Pick<
    FieldMetadataInterface,
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
