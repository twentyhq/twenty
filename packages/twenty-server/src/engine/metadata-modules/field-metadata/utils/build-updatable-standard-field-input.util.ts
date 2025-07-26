import { FieldMetadataType } from 'twenty-shared/types';

import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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
