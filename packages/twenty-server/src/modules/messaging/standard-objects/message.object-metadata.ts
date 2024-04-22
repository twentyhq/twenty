import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.message,
  namePlural: 'messages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Message',
  icon: 'IconMessage',
})
@IsNotAuditLogged()
@IsSystem()
export class MessageObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
    type: FieldMetadataType.TEXT,
    label: 'Header message Id',
    description: 'Message id from the message header',
    icon: 'IconHash',
  })
  headerMessageId: string;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageThread,
    type: FieldMetadataType.RELATION,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
  })
  @IsNullable()
  messageThread: Relation<MessageThreadObjectMetadata>;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.direction,
    type: FieldMetadataType.SELECT,
    label: 'Direction',
    description: 'Message Direction',
    icon: 'IconDirection',
    options: [
      { value: 'incoming', label: 'Incoming', position: 0, color: 'green' },
      { value: 'outgoing', label: 'Outgoing', position: 1, color: 'blue' },
    ],
    defaultValue: "'incoming'",
  })
  direction: string;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.subject,
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  subject: string;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.text,
    type: FieldMetadataType.TEXT,
    label: 'Text',
    description: 'Text',
    icon: 'IconMessage',
  })
  text: string;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.receivedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Received At',
    description: 'The date the message was received',
    icon: 'IconCalendar',
  })
  @IsNullable()
  receivedAt: string;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
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
  messageParticipants: Relation<MessageParticipantObjectMetadata[]>;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Message Attachments',
    description: 'Message Attachments',
    icon: 'IconPaperclip',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    inverseSideFieldKey: 'message',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  attachments: Relation<AttachmentObjectMetadata[]>;

  @FieldMetadata({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
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
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationObjectMetadata[]
  >;
}
