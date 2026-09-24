import { type EntityManager } from 'typeorm';

import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { getAgentChatThreadOwnerColumns } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-columns.util';

export type AgentChatThreadOwnerColumn =
  | 'userWorkspaceId'
  | 'workspaceMemberId';

// Workspace threads keep the legacy membership column until the 2.43 upgrade
// replaces it with the member relation, and it stays authoritative until then.
export const getAgentChatThreadOwnerColumn = async ({
  manager,
  workspaceId,
  storage,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  storage: AgentHistoryStorageState['storage'];
}): Promise<AgentChatThreadOwnerColumn> => {
  if (storage === 'core') {
    return 'userWorkspaceId';
  }

  const { hasUserWorkspaceIdColumn } = await getAgentChatThreadOwnerColumns({
    manager,
    workspaceId,
  });

  return hasUserWorkspaceIdColumn ? 'userWorkspaceId' : 'workspaceMemberId';
};
