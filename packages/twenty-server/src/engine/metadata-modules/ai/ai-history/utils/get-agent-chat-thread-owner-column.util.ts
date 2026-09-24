import { type EntityManager } from 'typeorm';

import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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

  const [{ hasUserWorkspaceIdColumn }]: {
    hasUserWorkspaceIdColumn: boolean;
  }[] = await manager.query(
    `SELECT EXISTS (
       SELECT 1 FROM pg_attribute
       WHERE attrelid = to_regclass($1) AND attname = 'userWorkspaceId' AND NOT attisdropped
     ) AS "hasUserWorkspaceIdColumn"`,
    [
      `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThread"`,
    ],
  );

  return hasUserWorkspaceIdColumn ? 'userWorkspaceId' : 'workspaceMemberId';
};
