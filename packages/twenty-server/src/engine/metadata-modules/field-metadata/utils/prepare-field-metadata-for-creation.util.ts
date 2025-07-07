import { v4 } from 'uuid';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { prepareCustomFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/utils/prepare-custom-field-metadata-for-options.util';

export const prepareCustomFieldMetadataForCreation = (
  fieldMetadataInput: CreateFieldInput,
) => {
  const options = fieldMetadataInput.options
    ? prepareCustomFieldMetadataOptions(fieldMetadataInput.options)
    : undefined;
  const defaultValue =
    fieldMetadataInput.defaultValue ??
    generateDefaultValue(fieldMetadataInput.type);

  return {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: fieldMetadataInput.name,
    label: fieldMetadataInput.label,
    icon: fieldMetadataInput.icon,
    type: fieldMetadataInput.type,
    isLabelSyncedWithName: fieldMetadataInput.isLabelSyncedWithName,
    objectMetadataId: fieldMetadataInput.objectMetadataId,
    workspaceId: fieldMetadataInput.workspaceId,
    isNullable: generateNullable(
      fieldMetadataInput.type,
      fieldMetadataInput.isNullable,
      fieldMetadataInput.isRemoteCreation,
    ),
    relationTargetObjectMetadataId:
      fieldMetadataInput?.relationCreationPayload?.targetObjectMetadataId,
    defaultValue,
    ...options,
    isActive: true,
    isCustom: true,
    settings: fieldMetadataInput.settings,
  };
};
