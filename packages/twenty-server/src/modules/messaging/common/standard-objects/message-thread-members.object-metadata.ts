import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { MessageThreadObjectMetadata } from 'src/modules/messaging/standard-objects/message-thread.object-metadata';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThreadMembers,
  namePlural: 'messageThreadMembers',
  labelSingular: 'Message Thread Member',
  labelPlural: 'Message Threads Members',
  description: 'Message Thread Members',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageThreadMembersObjectMetadata extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Thread',
    description: 'Message Thread that the member is part of',
    icon: 'IconMessage',
    joinColumn: 'messageThreadId',
    inverseSideFieldKey: 'messageThreadMembers',
    inverseSideTarget: () => MessageThreadObjectMetadata,
  })
  messageThread: Relation<MessageThreadObjectMetadata>;

  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workspace Member',
    description: 'Workspace Member that is part of the message thread',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
    inverseSideFieldKey: 'messageThreadMembers',
    inverseSideTarget: () => WorkspaceMemberObjectMetadata,
  })
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;
}
