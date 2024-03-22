import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { messageChannelMessageAssociationStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.messageChannelMessageAssociation,
  namePlural: 'messageChannelMessageAssociations',
  labelSingular: 'Message Channel Message Association',
  labelPlural: 'Message Channel Message Associations',
  description: 'Message Synced with a Message Channel',
  icon: 'IconMessage',
})
@IsSystem()
export class MessageChannelMessageAssociationObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: messageChannelMessageAssociationStandardFieldIds.messageChannel,
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Id',
    description: 'Message Channel Id',
    icon: 'IconHash',
    joinColumn: 'messageChannelId',
  })
  @IsNullable()
  messageChannel: MessageChannelObjectMetadata;

  @FieldMetadata({
    standardId: messageChannelMessageAssociationStandardFieldIds.message,
    type: FieldMetadataType.RELATION,
    label: 'Message Id',
    description: 'Message Id',
    icon: 'IconHash',
    joinColumn: 'messageId',
  })
  @IsNullable()
  message: MessageObjectMetadata;

  @FieldMetadata({
    standardId:
      messageChannelMessageAssociationStandardFieldIds.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Message External Id',
    description: 'Message id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageExternalId: string;

  @FieldMetadata({
    standardId: messageChannelMessageAssociationStandardFieldIds.messageThread,
    type: FieldMetadataType.RELATION,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
  })
  @IsNullable()
  messageThread: MessageThreadObjectMetadata;

  @FieldMetadata({
    standardId:
      messageChannelMessageAssociationStandardFieldIds.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Thread External Id',
    description: 'Thread id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageThreadExternalId: string;
}
