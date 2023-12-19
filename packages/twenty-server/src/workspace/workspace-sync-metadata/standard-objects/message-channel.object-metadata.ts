import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';

@ObjectMetadata({
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: 'IconMessage',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class MessageChannelObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    // This will be a type select later: metadata, subject, share_everything
    type: FieldMetadataType.TEXT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    defaultValue: { value: 'metadata' },
  })
  visibility: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: ConnectedAccountObjectMetadata;

  @FieldMetadata({
    // This will be a type select later : email, sms, chat
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Type',
    icon: 'IconMessage',
  })
  @IsNullable()
  type: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Threads',
    description: 'Threads from the channel.',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageThread',
  })
  @IsNullable()
  messageThreads: MessageThreadObjectMetadata[];
}
