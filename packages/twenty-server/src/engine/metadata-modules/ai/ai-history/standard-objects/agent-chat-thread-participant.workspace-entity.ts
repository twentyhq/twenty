import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AgentChatThreadParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  threadId: string;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  workspaceMemberId: string;

  lastReadAt: string | null;
  archivedAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
  lastMentionedAt: string | null;
}
