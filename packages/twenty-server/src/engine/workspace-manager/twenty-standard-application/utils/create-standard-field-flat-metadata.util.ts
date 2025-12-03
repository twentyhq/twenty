import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
  FieldMetadataDefaultValueForAnyType,
  FieldMetadataType,
} from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

export type CreateStandardFieldOptions<O extends AllStandardObjectName> = {
  fieldName: AllStandardObjectFieldName<O>;
  type: Exclude<FieldMetadataType, typeof FieldMetadataType.RELATION>;
  label: string;
  description: string;
  icon: string;
  isSystem?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: FieldMetadataDefaultValueForAnyType;
  settings?: Record<string, unknown> | null;
  options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null;
  createdAt: Date;
};

export type CreateStandardFieldArgs<O extends AllStandardObjectName> = {
  objectName: O;
  workspaceId: string;
  options: CreateStandardFieldOptions<O>;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

export const createStandardFieldFlatMetadata = <
  O extends AllStandardObjectName,
>({
  objectName,
  workspaceId,
  options,
  standardFieldMetadataIdByObjectAndFieldName,
}: CreateStandardFieldArgs<O>): FlatFieldMetadata => {
  const {
    fieldName,
    type,
    label,
    description,
    icon,
    isSystem = false,
    isNullable = true,
    isUnique = false,
    isUIReadOnly = false,
    defaultValue = null,
    settings = null,
    options: fieldOptions = null,
    createdAt,
  } = options;

  const objectFields = STANDARD_OBJECTS[objectName].fields;
  const fieldDefinition = objectFields[fieldName as keyof typeof objectFields];
  const fieldIds =
    standardFieldMetadataIdByObjectAndFieldName[objectName].fields;

  const name = fieldName.toString();
  return {
    id: fieldIds[fieldName],
    universalIdentifier: fieldDefinition.universalIdentifier,
    standardId: null,
    applicationId: TWENTY_STANDARD_APPLICATION_ID,
    workspaceId,
    objectMetadataId:
      standardFieldMetadataIdByObjectAndFieldName[objectName].id,
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
    defaultValue,
    settings,
    options: fieldOptions,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    viewGroupIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt,
    updatedAt: createdAt,
  };
};
