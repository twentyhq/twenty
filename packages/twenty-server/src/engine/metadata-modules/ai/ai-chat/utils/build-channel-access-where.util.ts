import { type FindOptionsWhere } from 'typeorm';

import { type AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

// A channel is visible to its members and, when public, to the whole
// workspace. Clauses are OR-ed by TypeORM.
export const buildChannelAccessWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<AgentChatChannelEntity> & {
  userWorkspaceId: string;
}): FindOptionsWhere<AgentChatChannelEntity>[] => [
  { ...where, members: { userWorkspaceId } },
  { ...where, visibility: AgentChatChannelVisibility.PUBLIC },
];
