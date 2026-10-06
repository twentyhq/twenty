import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class AgentChatChannelWorkspaceEntity extends BaseWorkspaceEntity {
  threads: EntityRelation<AgentChatThreadWorkspaceEntity[]>;
  members: EntityRelation<AgentChatChannelMemberWorkspaceEntity[]>;

  name: string;
  icon: string | null;
  color: string | null;
  visibility: AgentChatChannelVisibility;
}
