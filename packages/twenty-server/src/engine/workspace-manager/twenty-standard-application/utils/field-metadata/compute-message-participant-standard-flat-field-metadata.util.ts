import {
  FieldMetadataType,
  MessageParticipantRole,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildMessageParticipantStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<
  AllStandardObjectFieldName<'messageParticipant'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'messageParticipant',
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
    objectName: 'messageParticipant',
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
    objectName: 'messageParticipant',
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
    objectName: 'messageParticipant',
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
  role: createStandardFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'role',
      type: FieldMetadataType.SELECT,
      label: 'Role',
      description: 'Role',
      icon: 'IconAt',
      isNullable: false,
      defaultValue: `'${MessageParticipantRole.FROM}'`,
      options: [
        {
          value: MessageParticipantRole.FROM,
          label: 'From',
          position: 0,
          color: 'green',
        },
        {
          value: MessageParticipantRole.TO,
          label: 'To',
          position: 1,
          color: 'blue',
        },
        {
          value: MessageParticipantRole.CC,
          label: 'Cc',
          position: 2,
          color: 'orange',
        },
        {
          value: MessageParticipantRole.BCC,
          label: 'Bcc',
          position: 3,
          color: 'red',
        },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  handle: createStandardFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'handle',
      type: FieldMetadataType.TEXT,
      label: 'Handle',
      description: 'Handle',
      icon: 'IconAt',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  displayName: createStandardFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'displayName',
      type: FieldMetadataType.TEXT,
      label: 'Display Name',
      description: 'Display Name',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  message: createStandardRelationFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'message',
      label: 'Message',
      description: 'Message',
      icon: 'IconMessage',
      isNullable: false,
      createdAt,
      targetObjectName: 'message',
      targetFieldName: 'messageParticipants',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'messageId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  person: createStandardRelationFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'person',
      label: 'Person',
      description: 'Person',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'person',
      targetFieldName: 'messageParticipants',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'personId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  workspaceMember: createStandardRelationFieldFlatMetadata({
    objectName: 'messageParticipant',
    workspaceId,
    options: {
      fieldName: 'workspaceMember',
      label: 'Workspace Member',
      description: 'Workspace member',
      icon: 'IconCircleUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'messageParticipants',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'workspaceMemberId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
