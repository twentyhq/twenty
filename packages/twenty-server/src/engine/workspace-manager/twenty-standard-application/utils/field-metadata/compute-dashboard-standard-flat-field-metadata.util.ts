import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildDashboardStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'dashboard'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Creation date',
      description: 'Creation date',
      icon: 'IconCalendar',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: { displayFormat: 'RELATIVE' },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Dashboard-specific fields
  title: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'title',
      type: FieldMetadataType.TEXT,
      label: 'Title',
      description: 'Dashboard title',
      icon: 'IconNotes',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  position: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: 'Position',
      description: 'Dashboard record Position',
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  pageLayoutId: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'pageLayoutId',
      type: FieldMetadataType.UUID,
      label: 'Page Layout ID',
      description: 'Dashboard page layout',
      icon: 'IconLayout',
      isNullable: true,
      isUIReadOnly: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: 'Created by',
      description: 'The creator of the record',
      icon: 'IconCreativeCommonsSa',
      isUIReadOnly: true,
      isNullable: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  searchVector: createStandardFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: 'Search vector',
      description: 'Field used for full-text search',
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  timelineActivities: createStandardRelationFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'timelineActivities',
      label: 'Timeline Activities',
      description: 'Timeline activities linked to the dashboard',
      icon: 'IconTimelineEvent',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'timelineActivity',
      targetFieldName: 'dashboard',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favorites: createStandardRelationFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'favorites',
      label: 'Favorites',
      description: 'Favorites linked to the dashboard',
      icon: 'IconHeart',
      isSystem: true,
      isNullable: false,
      createdAt,
      targetObjectName: 'favorite',
      targetFieldName: 'dashboard',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  attachments: createStandardRelationFieldFlatMetadata({
    objectName: 'dashboard',
    workspaceId,
    options: {
      fieldName: 'attachments',
      label: 'Attachments',
      description: 'Attachments linked to the dashboard',
      icon: 'IconFileImport',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'attachment',
      targetFieldName: 'dashboard',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
