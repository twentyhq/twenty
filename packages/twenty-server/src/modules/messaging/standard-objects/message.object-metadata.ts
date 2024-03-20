import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { messageStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.message,
  namePlural: 'messages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Message',
  icon: 'IconMessage',
})
@IsSystem()
export class MessageObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: messageStandardFieldIds.headerMessageId,
    type: FieldMetadataType.TEXT,
    label: 'Header message Id',
    description: 'Message id from the message header',
    icon: 'IconHash',
  })
  headerMessageId: string;

  @FieldMetadata({
    standardId: messageStandardFieldIds.messageThread,
    type: FieldMetadataType.RELATION,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
  })
  @IsNullable()
  messageThread: MessageThreadObjectMetadata;

  @FieldMetadata({
    standardId: messageStandardFieldIds.direction,
    type: FieldMetadataType.SELECT,
    label: 'Direction',
    description: 'Message Direction',
    icon: 'IconDirection',
    options: [
      { value: 'incoming', label: 'Incoming', position: 0, color: 'green' },
      { value: 'outgoing', label: 'Outgoing', position: 1, color: 'blue' },
    ],
    defaultValue: { value: "'incoming'" },
  })
  direction: string;

  @FieldMetadata({
    standardId: messageStandardFieldIds.subject,
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  subject: string;

  @FieldMetadata({
    standardId: messageStandardFieldIds.text,
    type: FieldMetadataType.TEXT,
    label: 'Text',
    description: 'Text',
    icon: 'IconMessage',
  })
  text: string;

  @FieldMetadata({
    standardId: messageStandardFieldIds.receivedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Received At',
    description: 'The date the message was received',
    icon: 'IconCalendar',
  })
  @IsNullable()
  receivedAt: string;

  @FieldMetadata({
    standardId: messageStandardFieldIds.messageParticipants,
    type: FieldMetadataType.RELATION,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageParticipantObjectMetadata,
    inverseSideFieldKey: 'message',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  messageParticipants: MessageParticipantObjectMetadata[];

  @FieldMetadata({
    standardId: messageStandardFieldIds.messageChannelMessageAssociations,
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageChannelMessageAssociationObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  messageChannelMessageAssociations: MessageChannelMessageAssociationObjectMetadata[];
}
