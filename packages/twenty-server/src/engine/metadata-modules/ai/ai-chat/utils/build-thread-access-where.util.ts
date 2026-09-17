import { type FindOptionsWhere } from 'typeorm';

import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

// A thread is readable by its participants, by the members of its channel,
// and by everyone when its channel is public. The clauses are OR-ed by
// TypeORM, so any extra condition has to be repeated in each of them.
export const buildThreadAccessWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<AgentChatThreadEntity> & {
  userWorkspaceId: string;
}): FindOptionsWhere<AgentChatThreadEntity>[] => [
  { ...where, participants: { userWorkspaceId } },
  { ...where, channel: { members: { userWorkspaceId } } },
  { ...where, channel: { visibility: AgentChatChannelVisibility.PUBLIC } },
];
