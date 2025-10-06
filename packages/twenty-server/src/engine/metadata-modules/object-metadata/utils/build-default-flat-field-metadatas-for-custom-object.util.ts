import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

type BuildDefaultFlatFieldMetadataForCustomObjectArgs = {
  workspaceId: string;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id'>;
};

export type DefaultFlatFieldForCustomObjectMaps = ReturnType<
  typeof buildDefaultFlatFieldMetadatasForCustomObject
>;
// This could be replaced totally by an import schema + its transpilation when it's ready
export const buildDefaultFlatFieldMetadatasForCustomObject = ({
  workspaceId,
  flatObjectMetadata: { id: objectMetadataId },
}: BuildDefaultFlatFieldMetadataForCustomObjectArgs) => {
  const createdAt = new Date();
  const idField: FlatFieldMetadata<FieldMetadataType.UUID> = {
    type: FieldMetadataType.UUID,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: true,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      BASE_OBJECT_STANDARD_FIELD_IDS.id,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const nameField: FlatFieldMetadata<FieldMetadataType.TEXT> = {
    type: FieldMetadataType.TEXT,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
    ]),
    workspaceId,
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
    name: 'name',
    label: 'Name',
    icon: 'IconAbc',
    description: 'Name',
    isNullable: false,
    isActive: true,
    isCustom: false,
    isSystem: false,
    isUIReadOnly: false,
    defaultValue: "''",

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const createdAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const updatedAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const deletedAtField: FlatFieldMetadata<FieldMetadataType.DATE_TIME> = {
    type: FieldMetadataType.DATE_TIME,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const createdByField: FlatFieldMetadata<FieldMetadataType.ACTOR> = {
    type: FieldMetadataType.ACTOR,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const positionField: FlatFieldMetadata<FieldMetadataType.POSITION> = {
    type: FieldMetadataType.POSITION,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: null,
    morphId: null,
  };

  const searchVectorField: FlatFieldMetadata<FieldMetadataType.TS_VECTOR> = {
    type: FieldMetadataType.TS_VECTOR,
    id: v4(),
    isLabelSyncedWithName: false,
    isUnique: false,
    objectMetadataId,
    universalIdentifier: createDeterministicUuid([
      objectMetadataId,
      CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector,
    ]),
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

    createdAt,
    updatedAt: createdAt,
    options: null,
    standardOverrides: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: {
      asExpression: getTsVectorColumnExpressionFromFields([nameField]),
      generatedType: 'STORED',
    },
    morphId: null,
  };

  return {
    fields: {
      idField,
      nameField,
      createdAtField,
      updatedAtField,
      deletedAtField,
      createdByField,
      positionField,
      searchVectorField,
    },
  } as const satisfies {
    fields: Record<string, FlatFieldMetadata>;
  };
};
