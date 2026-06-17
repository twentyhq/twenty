import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
  type FieldMetadataDefaultValue,
  type FieldMetadataSettings,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

type WithRequiredId<T> = T & { id: string };

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
    isUIEditable?: boolean;
    defaultValue?: FieldMetadataDefaultValue<T>;
    settings?: FieldMetadataSettings<T>;
    options?:
      | WithRequiredId<FieldMetadataDefaultOption>[]
      | WithRequiredId<FieldMetadataComplexOption>[]
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
    isUIEditable = true,
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
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
    type,
    name,
    label,
    description,
    icon,
    isActive: true,
    isSystem,
    isSystemSideEffect: name in PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
    isNullable,
    isUnique,
    isUIEditable,
    isLabelSyncedWithName: false,
    standardOverrides: null,
    defaultValue: defaultValue ?? null,
    settings: settings ?? null,
    options: fieldOptions ?? null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    fieldPermissionIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECTS[objectName].universalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    universalSettings: settings ?? null,
  };
};
