import { extractAndSanitizeObjectStringFields } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type GetDefaultFlatFieldMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId' | 'objectMetadataId'>;
  flatApplication: FlatApplication;
  objectMetadataUniversalIdentifier: string;
};
export const getDefaultFlatFieldMetadata = ({
  createFieldInput,
  flatApplication,
  objectMetadataUniversalIdentifier,
}: GetDefaultFlatFieldMetadataArgs) => {
  const { defaultValue, settings } = extractAndSanitizeObjectStringFields(
    createFieldInput,
    ['defaultValue', 'settings'],
  );

  const createdAt = new Date().toISOString();

  return {
    description: createFieldInput.description ?? null,
    icon: createFieldInput.icon ?? null,
    isActive: true,
    isCustom: true,
    isLabelSyncedWithName: createFieldInput.isLabelSyncedWithName ?? false,
    isNullable: generateNullable(
      createFieldInput.isNullable,
      createFieldInput.isRemoteCreation,
    ),
    isSystem: createFieldInput.isSystem ?? false,
    isUnique: createFieldInput.isUnique ?? false,
    label: createFieldInput.label,
    name: createFieldInput.name,
    standardOverrides: null,
    type: createFieldInput.type,
    universalIdentifier: createFieldInput.universalIdentifier ?? v4(),
    options: createFieldInput.options ?? null,
    defaultValue: defaultValue ?? generateDefaultValue(createFieldInput.type),
    createdAt,
    updatedAt: createdAt,
    isUIReadOnly: createFieldInput.isUIReadOnly ?? false,
    morphId: null,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    universalSettings: settings ?? null,
  } as const satisfies UniversalFlatFieldMetadata;
};
