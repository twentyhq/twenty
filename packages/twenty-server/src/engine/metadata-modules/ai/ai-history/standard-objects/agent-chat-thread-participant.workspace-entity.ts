import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// A member's inbox state for one thread. doneAt is when the member took the
// thread out of their inbox: marked done, snoozed (the snooze end clears it)
// or unsubscribed. Activity after doneAt brings the thread back, unless the
// member unsubscribed.
export class AgentChatThreadParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  threadId: string;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  workspaceMemberId: string;

  lastReadAt: string | null;
  doneAt: string | null;
  snoozedUntil: string | null;
  isSubscribed: boolean;
  lastMentionedAt: string | null;
}
