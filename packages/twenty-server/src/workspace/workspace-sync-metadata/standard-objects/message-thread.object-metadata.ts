import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';

@ObjectMetadata({
  namePlural: 'messageThreads',
  labelSingular: 'Message Thread',
  labelPlural: 'Message Threads',
  description: 'Message Thread',
  icon: 'IconMessage',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class MessageThreadObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    // will be an array
    type: FieldMetadataType.TEXT,
    label: 'External Id',
    description: 'Thread id from the messaging provider',
    icon: 'IconMessage',
  })
  @IsNullable()
  externalId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  @IsNullable()
  subject: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Id',
    description: 'Message Channel Id',
    icon: 'IconHash',
    joinColumn: 'messageChannelId',
  })
  @IsNullable()
  messageChannel: MessageChannelObjectMetadata;

  @FieldMetadata({
    // This will be a type select later: default, subject, share_everything
    type: FieldMetadataType.TEXT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    defaultValue: { value: 'default' },
  })
  @IsNullable()
  visibility: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Messages',
    description: 'Messages from the thread.',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'message',
  })
  @IsNullable()
  messages: MessageObjectMetadata[];
}
