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
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

export const buildMessageChannelMessageAssociationStandardFlatFieldMetadatas =
  ({
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  }: {
    createdAt: Date;
    workspaceId: string;
    standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
  }): Record<
    AllStandardObjectFieldName<'messageChannelMessageAssociation'>,
    FlatFieldMetadata
  > => ({
    id: createStandardFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
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
      objectName: 'messageChannelMessageAssociation',
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
      objectName: 'messageChannelMessageAssociation',
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
      objectName: 'messageChannelMessageAssociation',
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
    messageExternalId: createStandardFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'messageExternalId',
        type: FieldMetadataType.TEXT,
        label: 'Message External Id',
        description: 'Message id from the messaging provider',
        icon: 'IconHash',
        isNullable: true,
        createdAt,
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
    messageThreadExternalId: createStandardFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'messageThreadExternalId',
        type: FieldMetadataType.TEXT,
        label: 'Thread External Id',
        description: 'Thread id from the messaging provider',
        icon: 'IconHash',
        isNullable: true,
        createdAt,
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
    direction: createStandardFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'direction',
        type: FieldMetadataType.SELECT,
        label: 'Direction',
        description: 'Message Direction',
        icon: 'IconDirection',
        isNullable: false,
        defaultValue: `'${MessageDirection.INCOMING}'`,
        options: [
          { value: MessageDirection.INCOMING, label: 'Incoming', position: 0, color: 'green' },
          { value: MessageDirection.OUTGOING, label: 'Outgoing', position: 1, color: 'blue' },
        ],
        createdAt,
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
    messageChannel: createStandardRelationFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'messageChannel',
        label: 'Message Channel Id',
        description: 'Message Channel Id',
        icon: 'IconHash',
        isNullable: true,
        createdAt,
        targetObjectName: 'messageChannel',
        targetFieldName: 'messageChannelMessageAssociations',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageChannelId',
        },
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
    messageThread: createStandardRelationFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'messageThread',
        label: 'Message Thread Id',
        description: 'Message Thread Id',
        icon: 'IconHash',
        isNullable: true,
        createdAt,
        targetObjectName: 'messageThread',
        targetFieldName: 'messageChannelMessageAssociations',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageThreadId',
        },
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
    message: createStandardRelationFieldFlatMetadata({
      objectName: 'messageChannelMessageAssociation',
      workspaceId,
      options: {
        fieldName: 'message',
        label: 'Message Id',
        description: 'Message Id',
        icon: 'IconHash',
        isNullable: true,
        createdAt,
        targetObjectName: 'message',
        targetFieldName: 'messageChannelMessageAssociations',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName: 'messageId',
        },
      },
      standardFieldMetadataIdByObjectAndFieldName,
    }),
  });
