import {
  type FieldMetadataDefaultValue,
  type FieldMetadataSettings,
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardFieldArgs<
  O extends AllStandardObjectName,
  T extends FieldMetadataType,
> = StandardBuilderArgs<'fieldMetadata'> & {
  objectName: O;
  context: {
    fieldName: AllStandardObjectFieldName<O>;
    type: T;
    label: string;
    description: string;
    icon: string;
    isSystem?: boolean;
    isNullable?: boolean;
    isUnique?: boolean;
    isUIReadOnly?: boolean;
    defaultValue?: FieldMetadataDefaultValue<T>;
    settings?: FieldMetadataSettings<T>;
    options?:
      | FieldMetadataDefaultOption[]
      | FieldMetadataComplexOption[]
      | null;
  };
};

export const createStandardFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends FieldMetadataType,
>({
  objectName,
  workspaceId,
  context: {
    fieldName,
    type,
    label,
    description,
    icon,
    isSystem = false,
    isNullable = true,
    isUnique = false,
    isUIReadOnly = false,
    defaultValue,
    settings,
    options: fieldOptions = null,
  },
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardFieldArgs<O, T>): FlatFieldMetadata => {
  const objectFields = STANDARD_OBJECTS[objectName].fields;
  const fieldDefinition = objectFields[fieldName as keyof typeof objectFields];
  const fieldIds = standardObjectMetadataRelatedEntityIds[objectName].fields;

  const name = fieldName.toString();

  return {
    id: fieldIds[fieldName].id,
    universalIdentifier: fieldDefinition.universalIdentifier,
    standardId: fieldDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
    type,
    name,
    label,
    description,
    icon,
    isCustom: false,
    isActive: true,
    isSystem,
    isNullable,
    isUnique,
    isUIReadOnly,
    isLabelSyncedWithName: false,
    standardOverrides: null,
    defaultValue: defaultValue ?? null,
    settings: settings ?? null,
    options: fieldOptions?.map((option) => ({ ...option, id: v4() })) ?? null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
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
