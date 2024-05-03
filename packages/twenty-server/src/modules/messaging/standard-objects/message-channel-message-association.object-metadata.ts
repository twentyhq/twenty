import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,
  namePlural: 'messageChannelMessageAssociations',
  labelSingular: 'Message Channel Message Association',
  labelPlural: 'Message Channel Message Associations',
  description: 'Message Synced with a Message Channel',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelMessageAssociationObjectMetadata extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Message External Id',
    description: 'Message id from the messaging provider',
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageExternalId: string;

  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Thread External Id',
    description: 'Thread id from the messaging provider',
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageThreadExternalId: string;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Channel Id',
    description: 'Message Channel Id',
    icon: 'IconHash',
    joinColumn: 'messageChannelId',
    inverseSideTarget: () => MessageChannelObjectMetadata,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
  })
  @WorkspaceIsNullable()
  messageChannel: Relation<MessageChannelObjectMetadata>;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Id',
    description: 'Message Id',
    icon: 'IconHash',
    joinColumn: 'messageId',
    inverseSideTarget: () => MessageObjectMetadata,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
  })
  @WorkspaceIsNullable()
  message: Relation<MessageObjectMetadata>;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
    inverseSideTarget: () => MessageThreadObjectMetadata,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
  })
  @WorkspaceIsNullable()
  messageThread: Relation<MessageThreadObjectMetadata>;
}
