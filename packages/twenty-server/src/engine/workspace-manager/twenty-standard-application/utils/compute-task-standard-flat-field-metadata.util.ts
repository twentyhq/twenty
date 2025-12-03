import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildTaskStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'task'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'task',
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
    objectName: 'task',
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
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'task',
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
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Task-specific fields
  position: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: 'Position',
      description: 'Task record position',
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  title: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'title',
      type: FieldMetadataType.TEXT,
      label: 'Title',
      description: 'Task title',
      icon: 'IconNotes',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  bodyV2: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'bodyV2',
      type: FieldMetadataType.RICH_TEXT_V2,
      label: 'Body',
      description: 'Task body',
      icon: 'IconFilePencil',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  dueAt: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'dueAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Due Date',
      description: 'Task due date',
      icon: 'IconCalendarEvent',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  status: createStandardFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'status',
      type: FieldMetadataType.SELECT,
      label: 'Status',
      description: 'Task status',
      icon: 'IconCheck',
      isNullable: true,
      defaultValue: "'TODO'",
      options: [
        { value: 'TODO', label: 'To do', position: 0, color: 'sky' },
        { value: 'IN_PROGRESS', label: 'In progress', position: 1, color: 'purple' },
        { value: 'DONE', label: 'Done', position: 2, color: 'green' },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName: 'task',
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
    objectName: 'task',
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
  taskTargets: createStandardRelationFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'taskTargets',
      label: 'Relations',
      description: 'Task targets',
      icon: 'IconArrowUpRight',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'taskTarget',
      targetFieldName: 'task',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  attachments: createStandardRelationFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'attachments',
      label: 'Attachments',
      description: 'Task attachments',
      icon: 'IconFileImport',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'attachment',
      targetFieldName: 'task',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  assignee: createStandardRelationFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'assignee',
      label: 'Assignee',
      description: 'Task assignee',
      icon: 'IconUserCircle',
      isNullable: true,
      createdAt,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'assignedTasks',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  timelineActivities: createStandardRelationFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'timelineActivities',
      label: 'Timeline Activities',
      description: 'Timeline Activities linked to the task.',
      icon: 'IconTimelineEvent',
      isSystem: true,
      isNullable: true,
      createdAt,
      targetObjectName: 'timelineActivity',
      targetFieldName: 'task',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favorites: createStandardRelationFieldFlatMetadata({
    objectName: 'task',
    workspaceId,
    options: {
      fieldName: 'favorites',
      label: 'Favorites',
      description: 'Favorites linked to the task',
      icon: 'IconHeart',
      isSystem: true,
      isNullable: false,
      createdAt,
      targetObjectName: 'favorite',
      targetFieldName: 'task',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});

