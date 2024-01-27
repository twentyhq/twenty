import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel-message-association.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';

@ObjectMetadata({
  namePlural: 'messages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Message',
  icon: 'IconMessage',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class MessageObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Header message Id',
    description: 'Message id from the message header',
    icon: 'IconHash',
  })
  headerMessageId: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
  })
  @IsNullable()
  messageThread: MessageThreadObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'Direction',
    description: 'Message Direction',
    icon: 'IconDirection',
    options: [
      { value: 'incoming', label: 'Incoming', position: 0, color: 'green' },
      { value: 'outgoing', label: 'Outgoing', position: 1, color: 'blue' },
    ],
    defaultValue: { value: 'incoming' },
  })
  direction: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  subject: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Text',
    description: 'Text',
    icon: 'IconMessage',
  })
  text: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Html',
    description: 'Html',
    icon: 'IconMessage',
  })
  html: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Received At',
    description: 'The date the message was received',
    icon: 'IconCalendar',
  })
  @IsNullable()
  receivedAt: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageParticipant',
    inverseSideFieldName: 'message',
  })
  @IsNullable()
  messageParticipants: MessageParticipantObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageChannelMessageAssociation',
  })
  @IsNullable()
  messageChannelMessageAssociation: MessageChannelMessageAssociationObjectMetadata[];
}
