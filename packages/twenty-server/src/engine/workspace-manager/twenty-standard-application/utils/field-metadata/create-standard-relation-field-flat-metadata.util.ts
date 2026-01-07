import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
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
  label: string;
  description: string;
  icon: string;
  targetObjectName: T;
  targetFieldName: AllStandardObjectFieldName<T>;
  isSystem?: boolean;
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
    isSystem = false,
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

  return {
    id: fieldIds[fieldName as keyof typeof fieldIds].id,
    universalIdentifier: fieldDefinition.universalIdentifier,
    standardId: fieldDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
    type,
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
    relationTargetFieldMetadataId: targetFieldIds[targetFieldName].id,
    relationTargetObjectMetadataId:
      standardObjectMetadataRelatedEntityIds[targetObjectName].id,
    morphId,
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
  };
};
