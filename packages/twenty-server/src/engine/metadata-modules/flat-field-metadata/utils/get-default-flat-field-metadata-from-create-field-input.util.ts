import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
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
    uniqueIdentifier: fieldMetadataId,
    workspaceId,
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
    options: null,
    defaultValue: defaultValue ?? null,
    settings: settings ?? null,
  } as const satisfies FlatFieldMetadata;
};
