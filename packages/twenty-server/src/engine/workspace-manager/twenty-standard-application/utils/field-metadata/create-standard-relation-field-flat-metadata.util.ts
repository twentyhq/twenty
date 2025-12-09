import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardRelationFieldContext<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  fieldName: AllStandardObjectFieldName<O>;
  label: string;
  description: string;
  icon: string;
  targetObjectName: T;
  targetFieldName: AllStandardObjectFieldName<T>;
  isSystem?: boolean;
  isNullable?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings: FieldMetadataSettings<FieldMetadataType.RELATION>;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
};

export type CreateStandardRelationFieldArgs<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  objectName: O;
  context: CreateStandardRelationFieldContext<O, T>;
} & Omit<StandardBuilderArgs<'fieldMetadata', O, any>, 'context' | 'objectName'>;

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
    isSystem = false,
    isNullable = true,
    isUIReadOnly = false,
    defaultValue = null,
    settings,
    options: fieldOptions = null,
  },
  standardFieldMetadataIdByObjectAndFieldName,
  twentyStandardApplicationId,
  now,
}: CreateStandardRelationFieldArgs<O, T>): FlatFieldMetadata => {
  const objectFields = STANDARD_OBJECTS[objectName].fields;
  const fieldDefinition = objectFields[fieldName as keyof typeof objectFields];
  const fieldIds =
    standardFieldMetadataIdByObjectAndFieldName[objectName].fields;

  const targetFieldIds =
    standardFieldMetadataIdByObjectAndFieldName[targetObjectName].fields;

  return {
    id: fieldIds[fieldName as keyof typeof fieldIds],
    universalIdentifier: fieldDefinition.universalIdentifier,
    standardId: null,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId:
      standardFieldMetadataIdByObjectAndFieldName[objectName].id,
    type: FieldMetadataType.RELATION,
    name: fieldName.toString(),
    label,
    description,
    icon,
    isCustom: false,
    isActive: true,
    isSystem,
    isNullable,
    isUnique: false,
    isUIReadOnly,
    isLabelSyncedWithName: false,
    standardOverrides: null,
    defaultValue,
    settings,
    options: fieldOptions,
    relationTargetFieldMetadataId: targetFieldIds[targetFieldName],
    relationTargetObjectMetadataId:
      standardFieldMetadataIdByObjectAndFieldName[targetObjectName].id,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
  };
};
