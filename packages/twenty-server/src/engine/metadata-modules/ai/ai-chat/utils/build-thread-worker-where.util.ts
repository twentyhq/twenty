import { type FindOptionsWhere } from 'typeorm';

import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

// Who works a thread, as opposed to who can read one. It is the reader set of
// buildThreadAccessWhere without its public-channel clause, plus the assignee
// of a public-channel thread.
//
// A public channel is readable by the whole workspace, and status belongs to
// the thread rather than to each reader, so letting every reader write it
// would let any passer-by clear a team's inbox for the team. The people who
// joined the channel, hold a role on it, are in the thread or have been handed
// it are the ones working it; everyone else reads, and joining is one click.
//
// The assignee clause is what covers being handed a thread, and it is only
// ever needed in a public channel: every other way of reading a thread already
// appears above and grants work rights on its own. It has to stay paired with
// that visibility, because assignment outlives access - removing a participant
// leaves the column set - and a standalone clause would keep authorizing
// somebody the thread is no longer readable by.
export const buildThreadWorkerWhere = ({
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
  {
    ...where,
    assigneeUserWorkspaceId: userWorkspaceId,
    channel: { visibility: AgentChatChannelVisibility.PUBLIC },
  },
];
