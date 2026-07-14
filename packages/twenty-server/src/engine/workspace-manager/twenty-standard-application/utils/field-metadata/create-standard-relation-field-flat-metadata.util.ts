import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { capitalize } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';
import {
  computeStandardFieldUniversalIdentifier,
  isReverseSystemRelationStandardField,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/get-standard-system-relation-field-universal-identifier.util';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';

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
  label: string;
  description: string;
  icon: string;
  targetObjectName: T;
  targetFieldName: AllStandardObjectFieldName<T>;
  isNullable?: boolean;
  isUIEditable?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings: FieldMetadataSettings<F>;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
  morphId: F extends FieldMetadataType.MORPH_RELATION ? string : null;
  junctionTargetFieldUniversalIdentifier?: string;
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
    isUIEditable = true,
    defaultValue = null,
    settings,
    options: fieldOptions = null,
    morphId,
    type,
    junctionTargetFieldUniversalIdentifier,
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

  // The reverse morph field of a default relation lives on a standard relation
  // object and points back at the source object (e.g. noteTarget.targetPerson).
  const isReverseSystemRelationField = isReverseSystemRelationStandardField({
    objectName,
    fieldName: fieldName.toString(),
  });

  // Reverse fields converge on name-derived label/icon (matching the engine
  // provisioner for custom objects) instead of the generic "Target".
  const resolvedLabel = isReverseSystemRelationField
    ? capitalize(targetObjectName)
    : label;
  const resolvedIcon = isReverseSystemRelationField
    ? (STANDARD_OBJECT_ICONS[
        objectName as keyof typeof STANDARD_OBJECT_ICONS
      ] ?? 'IconBuildingSkyscraper')
    : icon;

  return {
    id: fieldIds[fieldName as keyof typeof fieldIds].id,
    universalIdentifier: computeStandardFieldUniversalIdentifier({
      objectName,
      fieldName: fieldName.toString(),
      fallbackUniversalIdentifier: fieldDefinition.universalIdentifier,
    }),
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
    type,
    name: fieldName.toString(),
    label: resolvedLabel,
    description,
    icon: resolvedIcon,
    isActive: true,
    isSystem: false,
    isSystemSideEffect: isReverseSystemRelationField,
    isNullable,
    isUnique: false,
    isUIEditable,
    isLabelSyncedWithName: false,
    overrides: null,
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
    calendarEndViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS[objectName].universalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      STANDARD_OBJECTS[targetObjectName].universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      computeStandardFieldUniversalIdentifier({
        objectName: targetObjectName,
        fieldName: targetFieldName.toString(),
        fallbackUniversalIdentifier: targetFieldDefinition.universalIdentifier,
      }),
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataIds: [],
    searchFieldMetadataUniversalIdentifiers: [],
    universalSettings: {
      ...settings,
      ...(junctionTargetFieldUniversalIdentifier && {
        junctionTargetFieldUniversalIdentifier,
      }),
    },
  };
};
