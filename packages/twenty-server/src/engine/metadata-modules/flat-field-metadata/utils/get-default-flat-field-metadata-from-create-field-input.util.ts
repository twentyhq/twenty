import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type GetDefaultFlatFieldMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId' | 'objectMetadataId'>;
  flatApplication: FlatApplication;
  objectMetadataUniversalIdentifier: string;
  isSystemSideEffect?: boolean;
};
export const getDefaultFlatFieldMetadata = ({
  createFieldInput,
  flatApplication,
  objectMetadataUniversalIdentifier,
  isSystemSideEffect = false,
}: GetDefaultFlatFieldMetadataArgs) => {
  const { defaultValue, settings } = extractAndSanitizeObjectStringFields(
    createFieldInput,
    ['defaultValue', 'settings'],
  );

  const createdAt = new Date().toISOString();
  const resolvedDefaultValue =
    defaultValue ?? generateDefaultValue(createFieldInput.type);

  return {
    description: createFieldInput.description ?? null,
    icon: createFieldInput.icon ?? null,
    isActive: true,
    isLabelSyncedWithName: createFieldInput.isLabelSyncedWithName ?? false,
    isNullable: generateNullable(
      createFieldInput.isNullable,
      createFieldInput.isRemoteCreation,
    ),
    isSystem: createFieldInput.isSystem ?? false,
    isSystemSideEffect,
    isUnique: createFieldInput.isUnique ?? false,
    label: createFieldInput.label,
    name: createFieldInput.name,
    standardOverrides: null,
    type: createFieldInput.type,
    universalIdentifier: createFieldInput.universalIdentifier ?? v4(),
    options: createFieldInput.options ?? null,
    defaultValue: isCompositeFieldMetadataType(createFieldInput.type)
      ? nullifyEmptyCompositeDefaultValue({
          defaultValue: resolvedDefaultValue,
          fieldType: createFieldInput.type,
        })
      : resolvedDefaultValue,
    createdAt,
    updatedAt: createdAt,
    // isUIReadOnly is the deprecated alias of isUIEditable (inverted
    // polarity), kept for one release; isUIEditable wins when both are set.
    isUIEditable:
      createFieldInput.isUIEditable ??
      (isDefined(createFieldInput.isUIReadOnly)
        ? !createFieldInput.isUIReadOnly
        : true),
    morphId: null,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    universalSettings: settings ?? null,
    viewSortUniversalIdentifiers: [],
  } as const satisfies UniversalFlatFieldMetadata;
};
