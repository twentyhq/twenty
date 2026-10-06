import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AgentChatChannelMemberWorkspaceEntity extends BaseWorkspaceEntity {
  channel: EntityRelation<AgentChatChannelWorkspaceEntity>;
  channelId: string;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  workspaceMemberId: string;

  position: number;
}
