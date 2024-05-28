import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_THREAD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MessageThreadMemberWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-thread-members.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThread,
  namePlural: 'messageThreads',
  labelSingular: 'Message Thread',
  labelPlural: 'Message Threads',
  description: 'Message Thread',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageThreadWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_THREAD_STANDARD_FIELD_IDS.everyone,
    type: FieldMetadataType.BOOLEAN,
    label: 'Everyone',
    description: 'Permission to everyone',
    icon: 'IconCalendar',
    defaultValue: false,
  })
  everyone: boolean;

  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Messages',
    description: 'Messages from the thread.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messages: Relation<MessageWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_STANDARD_FIELD_IDS.messageThreadMember,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Threads',
    description: 'Message Threads',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageThreadMemberWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  messageThreadMember: Relation<MessageThreadMemberWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId:
      MESSAGE_THREAD_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Channel Association',
    description: 'Messages from the channel',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.RESTRICT,
  })
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
