import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,
  namePlural: 'messageChannelMessageAssociations',
  labelSingular: 'Message Channel Message Association',
  labelPlural: 'Message Channel Message Associations',
  description: 'Message Synced with a Message Channel',
  icon: 'IconMessage',
})
@IsNotAuditLogged()
@IsSystem()
export class MessageChannelMessageAssociationObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Id',
    description: 'Message Channel Id',
    icon: 'IconHash',
    joinColumn: 'messageChannelId',
  })
  @IsNullable()
  messageChannel: Relation<MessageChannelObjectMetadata>;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
    type: FieldMetadataType.RELATION,
    label: 'Message Id',
    description: 'Message Id',
    icon: 'IconHash',
    joinColumn: 'messageId',
  })
  @IsNullable()
  message: Relation<MessageObjectMetadata>;

  @FieldMetadata({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Message External Id',
    description: 'Message id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageExternalId: string;

  @FieldMetadata({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThread,
    type: FieldMetadataType.RELATION,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
  })
  @IsNullable()
  messageThread: Relation<MessageThreadObjectMetadata>;

  @FieldMetadata({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Thread External Id',
    description: 'Thread id from the messaging provider',
    icon: 'IconHash',
  })
  @IsNullable()
  messageThreadExternalId: string;
}
