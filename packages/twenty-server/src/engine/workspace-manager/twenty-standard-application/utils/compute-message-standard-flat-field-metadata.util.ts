import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildMessageStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'message'>, FlatFieldMetadata> => ({
  id: createStandardFieldFlatMetadata({
    objectName: 'message',
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
    objectName: 'message',
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
    objectName: 'message',
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
    objectName: 'message',
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
  headerMessageId: createStandardFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'headerMessageId',
      type: FieldMetadataType.TEXT,
      label: 'Header message Id',
      description: 'Message id from the message header',
      icon: 'IconHash',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  direction: createStandardFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'direction',
      type: FieldMetadataType.SELECT,
      label: 'Direction',
      description: 'Message Direction',
      icon: 'IconDirection',
      isNullable: false,
      defaultValue: "'INCOMING'",
      options: [
        { value: 'INCOMING', label: 'Incoming', position: 0, color: 'green' },
        { value: 'OUTGOING', label: 'Outgoing', position: 1, color: 'blue' },
      ],
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  subject: createStandardFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'subject',
      type: FieldMetadataType.TEXT,
      label: 'Subject',
      description: 'Subject',
      icon: 'IconMessage',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  text: createStandardFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'text',
      type: FieldMetadataType.TEXT,
      label: 'Text',
      description: 'Text',
      icon: 'IconMessage',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  receivedAt: createStandardFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'receivedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Received At',
      description: 'The date the message was received',
      icon: 'IconCalendar',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageThread: createStandardRelationFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'messageThread',
      label: 'Message Thread Id',
      description: 'Message Thread Id',
      icon: 'IconHash',
      isNullable: true,
      createdAt,
      targetObjectName: 'messageThread',
      targetFieldName: 'messages',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'messageThreadId',
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageParticipants: createStandardRelationFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'messageParticipants',
      label: 'Message Participants',
      description: 'Message Participants',
      icon: 'IconUserCircle',
      isNullable: true,
      createdAt,
      targetObjectName: 'messageParticipant',
      targetFieldName: 'message',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageChannelMessageAssociations: createStandardRelationFieldFlatMetadata({
    objectName: 'message',
    workspaceId,
    options: {
      fieldName: 'messageChannelMessageAssociations',
      label: 'Message Channel Association',
      description: 'Messages from the channel.',
      icon: 'IconMessage',
      isNullable: true,
      createdAt,
      targetObjectName: 'messageChannelMessageAssociation',
      targetFieldName: 'message',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
