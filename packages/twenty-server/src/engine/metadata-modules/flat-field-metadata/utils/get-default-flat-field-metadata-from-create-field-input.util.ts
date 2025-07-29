import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type getDefaultFlatFieldMetadataArgs = {
  fieldMetadataId: string;
  createdAt: Date;
  createFieldInput: CreateFieldInput;
};
export const getDefaultFlatFieldMetadata = ({
  createdAt,
  createFieldInput,
  fieldMetadataId,
}: getDefaultFlatFieldMetadataArgs) => {
  return {
    createdAt,
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
    objectMetadataId: createFieldInput.objectMetadataId, // TODO prastoin double check that CreateFieldInput validation runs correctly
    options: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    standardId: null,
    standardOverrides: null,
    type: createFieldInput.type,
    uniqueIdentifier: fieldMetadataId,
    updatedAt: createdAt,
    workspaceId: createFieldInput.workspaceId,
    settings: createFieldInput.settings ?? null,
    defaultValue:
      createFieldInput.defaultValue ??
      generateDefaultValue(createFieldInput.type), // TODO improve to be within each switch case
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  } as const satisfies FlatFieldMetadata;
};
