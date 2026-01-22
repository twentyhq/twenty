import {
  FieldMetadataType,
  type NonNullableRequired,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-migration/constant/standard-field-ids';

type BuildDefaultFlatFieldMetadataForCustomObjectArgs = {
  workspaceId: string;
  flatObjectMetadata: NonNullableRequired<
    Pick<FlatObjectMetadata, 'id' | 'applicationId'>
  >;
  skipNameField?: boolean;
};

export type DefaultFlatFieldForCustomObjectMaps = ReturnType<
  typeof buildDefaultFlatFieldMetadatasForCustomObject
>;
// This could be replaced totally by an import schema + its transpilation when it's ready
export const buildDefaultFlatFieldMetadatasForCustomObject = ({
  workspaceId,
  flatObjectMetadata: { id: objectMetadataId, applicationId },
  skipNameField = false,
}: BuildDefaultFlatFieldMetadataForCustomObjectArgs) => {
  const createdAt = new Date().toISOString();
  const idFieldId = v4();
  const idField: FlatFieldMetadata<FieldMetadataType.UUID> = {
    type: FieldMetadataType.UUID,
    id: idFieldId,
    viewFieldIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: true,
    objectMetadataId,
    universalIdentifier: idFieldId,
    workspaceId,
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
    name: 'id',
    label: 'Id',
    icon: 'Icon123',
    description: 'Id',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: true,
    isUIReadOnly: true,
    defaultValue: 'uuid',
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const nameFieldId = skipNameField ? null : v4();
  const nameField: FlatFieldMetadata<FieldMetadataType.TEXT> | null =
    skipNameField
      ? null
      : {
          type: FieldMetadataType.TEXT,
          id: nameFieldId!,
          viewFieldIds: [],
          mainGroupByFieldMetadataViewIds: [],
          kanbanAggregateOperationViewIds: [],
          calendarViewIds: [],
          isLabelSyncedWithName: false,
          isUnique: false,
          objectMetadataId,
          universalIdentifier: nameFieldId!,
          workspaceId,
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
          name: 'name',
          label: 'Name',
          icon: 'IconAbc',
          description: 'Name',
          isNullable: true,
          isActive: true,
          isCustom: false,
          isSystem: false,
          isUIReadOnly: false,
          defaultValue: null,
          viewFilterIds: [],

          createdAt,
          updatedAt: createdAt,
          options: null,
          standardOverrides: null,
          relationTargetFieldMetadataId: null,
          relationTargetObjectMetadataId: null,
          settings: null,
          morphId: null,
          applicationId,
        };

  const createdAtFieldId = v4();
  const createdAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: createdAtFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createdAtFieldId,
    workspaceId,
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
    name: 'createdAt',
    label: 'Creation date',
    icon: 'IconCalendar',
    description: 'Creation date',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: true,
    defaultValue: 'now',
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const updatedAtFieldId = v4();
  const updatedAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: updatedAtFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: updatedAtFieldId,
    workspaceId,
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
    name: 'updatedAt',
    label: 'Last update',
    icon: 'IconCalendarClock',
    description: 'Last time the record was changed',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: true,
    defaultValue: 'now',
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const deletedAtFieldId = v4();
  const deletedAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: deletedAtFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: deletedAtFieldId,
    workspaceId,
    standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    name: 'deletedAt',
    label: 'Deleted at',
    icon: 'IconCalendarClock',
    description: 'Deletion date',
    isNullable: true,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: true,
    defaultValue: null,
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const createdByFieldId = v4();
  const createdByField: FlatFieldMetadata<FieldMetadataType.ACTOR> = {
    type: FieldMetadataType.ACTOR,
    id: createdByFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createdByFieldId,
    workspaceId,
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
    name: 'createdBy',
    label: 'Created by',
    icon: 'IconCreativeCommonsSa',
    description: 'The creator of the record',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: true,
    defaultValue: { name: "''", source: "'MANUAL'" },
    viewFilterIds: [],
    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const updatedByFieldId = v4();
  const updatedByField: FlatFieldMetadata<FieldMetadataType.ACTOR> = {
    type: FieldMetadataType.ACTOR,
    id: updatedByFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: updatedByFieldId,
    workspaceId,
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.updatedBy,
    name: 'updatedBy',
    label: 'Updated by',
    icon: 'IconUserCircle',
    description: 'The workspace member who last updated the record',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: true,
    defaultValue: { name: "''", source: "'MANUAL'" },
    viewFilterIds: [],
    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const positionFieldId = v4();
  const positionField: FlatFieldMetadata<FieldMetadataType.POSITION> = {
    type: FieldMetadataType.POSITION,
    id: positionFieldId,
    viewFieldIds: [],
    mainGroupByFieldMetadataViewIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: positionFieldId,
    workspaceId,
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
    name: 'position',
    label: 'Position',
    icon: 'IconHierarchy2',
    description: 'Position',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: true,
    isUIReadOnly: true,
    defaultValue: 0,
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
    applicationId,
  };

  const searchVectorFieldId = v4();
  const searchVectorField: FlatFieldMetadata<FieldMetadataType.TS_VECTOR> = {
    type: FieldMetadataType.TS_VECTOR,
    mainGroupByFieldMetadataViewIds: [],
    viewFieldIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    id: searchVectorFieldId,
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: searchVectorFieldId,
    workspaceId,
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector,
    name: 'searchVector',
    label: 'Search vector',
    icon: 'IconSearch',
    description: 'Search vector',
    isNullable: true,
    isActive: true,
    isCustom: false,
    isSystem: true,
    isUIReadOnly: true,
    defaultValue: null,
    viewFilterIds: [],

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: {
      asExpression: getTsVectorColumnExpressionFromFields(
        nameField ? [nameField] : [],
      ),
      generatedType: 'STORED',
    },
    morphId: null,
    applicationId,
  };

  return {
    fields: {
      idField,
      ...(nameField && { nameField }),
      createdAtField,
      updatedAtField,
      updatedByField,
      deletedAtField,
      createdByField,
      positionField,
      searchVectorField,
    },
  } as const satisfies {
    fields: Record<string, FlatFieldMetadata>;
  };
};
