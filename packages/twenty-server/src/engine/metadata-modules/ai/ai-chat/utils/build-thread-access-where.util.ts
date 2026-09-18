import { type FindOptionsWhere } from 'typeorm';

import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

// A thread is readable by its creator, by its participants, by the members of
// its channel, by everyone holding one of its channel's roles, and by everyone
// when its channel is public. The clauses are OR-ed by TypeORM, so any extra
// condition has to be repeated in each of them.
//
// The creator clause is what the owner participant row already grants, since
// that row is written from this same column and cannot be removed or handed
// over. Stating it here too keeps a thread reachable by its owner in the
// window a deploy opens: the fast command creates the participant table, the
// instance serves traffic, and the slow command fills it in a later pass.
export const buildThreadAccessWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<AgentChatThreadEntity> & {
  userWorkspaceId: string;
}): FindOptionsWhere<AgentChatThreadEntity>[] => [
  { ...where, userWorkspaceId },
  { ...where, participants: { userWorkspaceId } },
  { ...where, channel: { members: { userWorkspaceId } } },
  {
    ...where,
    channel: { roles: { role: { roleTargets: { userWorkspaceId } } } },
  },
  { ...where, channel: { visibility: AgentChatChannelVisibility.PUBLIC } },
];
