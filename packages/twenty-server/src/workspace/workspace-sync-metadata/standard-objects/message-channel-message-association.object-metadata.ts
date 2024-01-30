import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';

@ObjectMetadata({
  namePlural: 'messageChannelMessageAssociations',
  labelSingular: 'Message Channel Message Association',
  labelPlural: 'Message Channel Message Associations',
  description: 'Message Synced with a Message Channel',
  icon: 'IconMessage',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class MessageChannelMessageAssociationObjectMetadata extends BaseObjectMetadata {
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
    type: FieldMetadataType.RELATION,
    label: 'Message Id',
    description: 'Message Id',
    icon: 'IconHash',
    joinColumn: 'messageId',
  })
  @IsNullable()
  message: MessageObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Message External Id',
    description: 'Message id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageExternalId: string;

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
    type: FieldMetadataType.TEXT,
    label: 'Thread External Id',
    description: 'Thread id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageThreadExternalId: string;
}
