import { type FindOptionsWhere } from 'typeorm';

import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';

// Who works a thread, as opposed to who can read one. It is the reader set of
// buildThreadAccessWhere without its public-channel clause, plus the assignee.
//
// A public channel is readable by the whole workspace, and status belongs to
// the thread rather than to each reader, so letting every reader write it
// would let any passer-by clear a team's inbox for the team. The people who
// joined the channel, hold a role on it, are in the thread or have been handed
// it are the ones working it; everyone else reads, and joining is one click.
export const buildThreadWorkerWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<AgentChatThreadEntity> & {
  userWorkspaceId: string;
}): FindOptionsWhere<AgentChatThreadEntity>[] => [
  { ...where, userWorkspaceId },
  { ...where, assigneeUserWorkspaceId: userWorkspaceId },
  { ...where, participants: { userWorkspaceId } },
  { ...where, channel: { members: { userWorkspaceId } } },
  {
    ...where,
    channel: { roles: { role: { roleTargets: { userWorkspaceId } } } },
  },
];
