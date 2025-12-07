import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValueForAnyType,
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardFieldByObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

export type CreateStandardRelationFieldOptions<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  fieldName: AllStandardFieldByObjectName<O>;
  label: string;
  description: string;
  icon: string;
  targetObjectName: T;
  targetFieldName: AllStandardFieldByObjectName<T>;
  isSystem?: boolean;
  isNullable?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings: FieldMetadataSettings<FieldMetadataType.RELATION>;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
  createdAt: Date;
};

export type CreateStandardRelationFieldArgs<
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
> = {
  objectName: O;
  workspaceId: string;
  options: CreateStandardRelationFieldOptions<O, T>;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

export const createStandardRelationFieldFlatMetadata = <
  O extends AllStandardObjectName,
  T extends AllStandardObjectName,
>({
  objectName,
  workspaceId,
  options,
  standardFieldMetadataIdByObjectAndFieldName,
}: CreateStandardRelationFieldArgs<O, T>): FlatFieldMetadata => {
  const {
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
    createdAt,
  } = options;

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
    applicationId: TWENTY_STANDARD_APPLICATION_ID,
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
    createdAt,
    updatedAt: createdAt,
  };
};
