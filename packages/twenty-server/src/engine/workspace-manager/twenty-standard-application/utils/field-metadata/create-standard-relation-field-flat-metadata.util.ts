import { type MessageDescriptor } from '@lingui/core';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardRelationFieldContext<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = CreateStandardMorphOrRelationFieldContext<
  O,
  T,
  FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
>;

export type CreateStandardMorphOrRelationFieldContext<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
  F extends FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION,
> = {
  type: F;
  fieldName: AllStandardObjectFieldName<O>;
  // label/icon are optional for default relation targets (note/task/attachment/
  // timeline): when omitted they fall back to the shared canonical appearance.
  label?: string;
  description: string;
  icon?: string;
  targetObjectName: T;
  targetFieldName: AllStandardObjectFieldName<T>;
  isNullable?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings: FieldMetadataSettings<F>;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
  morphId: F extends FieldMetadataType.MORPH_RELATION ? string : null;
};

export type CreateStandardRelationFieldArgs<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = StandardBuilderArgs<'fieldMetadata'> & {
  objectName: O;
  context: CreateStandardRelationFieldContext<O, T>;
};

export const createStandardRelationFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
>({
  objectName,
  workspaceId,
  context: {
    fieldName,
    label,
    description,
    icon,
    targetObjectName,
    targetFieldName,
    isNullable = true,
    isUIReadOnly = false,
    defaultValue = null,
    settings,
    options: fieldOptions = null,
    morphId,
    type,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardRelationFieldArgs<O, T>): FlatFieldMetadata => {
  const objectFields = STANDARD_OBJECTS[objectName].fields;
  const fieldDefinition = objectFields[fieldName as keyof typeof objectFields];
  const fieldIds = standardObjectMetadataRelatedEntityIds[objectName].fields;

  const targetFieldIds =
    standardObjectMetadataRelatedEntityIds[targetObjectName].fields;

  const targetObjectFields = STANDARD_OBJECTS[targetObjectName].fields;
  const targetFieldDefinition =
    targetObjectFields[targetFieldName as keyof typeof targetObjectFields];

  const defaultProperties = (
    STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT as Record<
      string,
      { label: MessageDescriptor; icon: string } | undefined
    >
  )[targetObjectName];

  const resolvedLabel =
    label ??
    (isDefined(defaultProperties)
      ? i18nLabel(defaultProperties.label)
      : undefined);
  const resolvedIcon = icon ?? defaultProperties?.icon;

  if (!isDefined(resolvedLabel) || !isDefined(resolvedIcon)) {
    throw new Error(
      `Relation field "${objectName}.${fieldName.toString()}" must define a label and icon (no canonical default for target "${targetObjectName}")`,
    );
  }

  return {
    id: fieldIds[fieldName as keyof typeof fieldIds].id,
    universalIdentifier: fieldDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
    type,
    name: fieldName.toString(),
    label: resolvedLabel,
    description,
    icon: resolvedIcon,
    isCustom: false,
    isActive: true,
    isSystem: false,
    isNullable,
    isUnique: false,
    isUIReadOnly,
    isLabelSyncedWithName: false,
    standardOverrides: null,
    defaultValue,
    settings,
    options: fieldOptions,
    relationTargetFieldMetadataId: targetFieldIds[targetFieldName].id,
    relationTargetObjectMetadataId:
      standardObjectMetadataRelatedEntityIds[targetObjectName].id,
    morphId,
    viewFieldIds: [],
    viewFilterIds: [],
    fieldPermissionIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
    applicationUniversalIdentifier: twentyStandardApplicationId,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS[objectName].universalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS[targetObjectName].universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      targetFieldDefinition.universalIdentifier,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    universalSettings: settings,
  };
};
