import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageRecipientObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-recipient.object-metadata';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';

@ObjectMetadata({
  namePlural: 'message',
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
    // will be an array
    type: FieldMetadataType.TEXT,
    label: 'External Id',
    description: 'Message id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  externalId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Header message Id',
    description: 'Message id from the message header',
    icon: 'IconHash',
  })
  @IsNullable()
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
    // will be a select later: incoming, outgoing
    type: FieldMetadataType.TEXT,
    label: 'Direction',
    description: 'Direction',
    icon: 'IconDirection',
    defaultValue: { value: 'incoming' },
  })
  direction: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  @IsNullable()
  subject: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Body',
    icon: 'IconMessage',
  })
  @IsNullable()
  body: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Date',
    description: 'Date',
    icon: 'IconCalendar',
  })
  @IsNullable()
  date: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Recipients',
    description: 'Message Recipients',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageRecipient',
    inverseSideFieldName: 'message',
  })
  @IsNullable()
  messageRecipients: MessageRecipientObjectMetadata[];
}
