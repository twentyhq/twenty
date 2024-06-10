import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThreadMember,
  namePlural: 'messageThreadMember',
  labelSingular: 'Message Thread Member',
  labelPlural: 'Message Threads Members',
  description: 'Message Thread Members',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageThreadMemberWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Thread',
    description: 'Message Thread that the member is part of',
    icon: 'IconMessage',
    joinColumn: 'messageThreadId',
    inverseSideFieldKey: 'messageThreadMember',
    inverseSideTarget: () => MessageThreadWorkspaceEntity,
  })
  messageThread: Relation<MessageThreadWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_MEMBERS_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workspace Member',
    description: 'Workspace Member that is part of the message thread',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
    inverseSideFieldKey: 'messageThreadMember',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
  })
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;
}
