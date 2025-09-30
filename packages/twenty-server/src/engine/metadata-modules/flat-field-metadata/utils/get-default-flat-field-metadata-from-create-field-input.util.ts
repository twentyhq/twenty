import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type GetDefaultFlatFieldMetadataArgs = {
  fieldMetadataId: string;
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
  workspaceId: string;
};
export const getDefaultFlatFieldMetadata = ({
  createFieldInput,
  fieldMetadataId,
  workspaceId,
}: GetDefaultFlatFieldMetadataArgs) => {
  const { defaultValue, settings } = extractAndSanitizeObjectStringFields(
    createFieldInput,
    ['defaultValue', 'settings'],
  );

  const createdAt = new Date();

  return {
    description: createFieldInput.description ?? null,
    id: fieldMetadataId,
    icon: createFieldInput.icon ?? null,
    isActive: true,
    isCustom: true,
    isLabelSyncedWithName: createFieldInput.isLabelSyncedWithName ?? false,
    isNullable: generateNullable(
      createFieldInput.type,
      createFieldInput.isNullable,
      createFieldInput.isRemoteCreation,
    ),
    isSystem: false,
    isUnique: createFieldInput.isUnique ?? null,
    label: createFieldInput.label ?? null,
    name: createFieldInput.name ?? null,
    objectMetadataId: createFieldInput.objectMetadataId,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    standardId: null,
    standardOverrides: null,
    type: createFieldInput.type,
    universalIdentifier: fieldMetadataId,
    workspaceId,
    options: null,
    defaultValue: defaultValue ?? generateDefaultValue(createFieldInput.type),
    settings: settings ?? null,
    createdAt,
    updatedAt: createdAt,
    isUIReadOnly: createFieldInput.isUIReadOnly ?? false,
    morphId: null,
  } as const satisfies FlatFieldMetadata;
};
