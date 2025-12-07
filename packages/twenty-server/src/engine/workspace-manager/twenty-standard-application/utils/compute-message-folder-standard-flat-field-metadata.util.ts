import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardFieldByObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildMessageFolderStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardFieldByObjectName<'messageFolder'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
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
    objectName: 'messageFolder',
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
    objectName: 'messageFolder',
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
    objectName: 'messageFolder',
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
  name: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'name',
      type: FieldMetadataType.TEXT,
      label: 'Name',
      description: 'Folder name',
      icon: 'IconFolder',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  syncCursor: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'syncCursor',
      type: FieldMetadataType.TEXT,
      label: 'Sync Cursor',
      description: 'Sync Cursor',
      icon: 'IconHash',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  isSentFolder: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'isSentFolder',
      type: FieldMetadataType.BOOLEAN,
      label: 'Is Sent Folder',
      description: 'Is Sent Folder',
      icon: 'IconCheck',
      isNullable: false,
      defaultValue: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  isSynced: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'isSynced',
      type: FieldMetadataType.BOOLEAN,
      label: 'Is Synced',
      description: 'Is Synced',
      icon: 'IconCheck',
      isNullable: false,
      defaultValue: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  parentFolderId: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'parentFolderId',
      type: FieldMetadataType.TEXT,
      label: 'Parent Folder ID',
      description: 'Parent Folder ID',
      icon: 'IconFolder',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  externalId: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'externalId',
      type: FieldMetadataType.TEXT,
      label: 'External ID',
      description: 'External ID',
      icon: 'IconHash',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  pendingSyncAction: createStandardFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'pendingSyncAction',
      type: FieldMetadataType.SELECT,
      label: 'Pending Sync Action',
      description: 'Pending action for folder sync',
      icon: 'IconReload',
      isNullable: false,
      defaultValue: "'NONE'",
      options: [
        {
          value: 'FOLDER_DELETION',
          label: 'Folder deletion',
          position: 0,
          color: 'red',
        },
        { value: 'NONE', label: 'None', position: 1, color: 'blue' },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageChannel: createStandardRelationFieldFlatMetadata({
    objectName: 'messageFolder',
    workspaceId,
    options: {
      fieldName: 'messageChannel',
      label: 'Message Channel',
      description: 'Message Channel',
      icon: 'IconMessage',
      isNullable: false,
      createdAt,
      targetObjectName: 'messageChannel',
      targetFieldName: 'messageFolders',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'messageChannelId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
