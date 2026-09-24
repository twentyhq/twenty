import { type EntityManager } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type AgentChatThreadOwnerColumns = {
  hasUserWorkspaceIdColumn: boolean;
  hasWorkspaceMemberIdColumn: boolean;
};

export const getAgentChatThreadOwnerColumns = async ({
  manager,
  workspaceId,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
}): Promise<AgentChatThreadOwnerColumns> => {
  const [columns]: AgentChatThreadOwnerColumns[] = await manager.query(
    `SELECT
       bool_or(attname = 'userWorkspaceId') AS "hasUserWorkspaceIdColumn",
       bool_or(attname = 'workspaceMemberId') AS "hasWorkspaceMemberIdColumn"
     FROM pg_attribute
     WHERE attrelid = to_regclass($1) AND NOT attisdropped
       AND attname IN ('userWorkspaceId', 'workspaceMemberId')`,
    [
      `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."agentChatThread"`,
    ],
  );

  return {
    hasUserWorkspaceIdColumn: columns?.hasUserWorkspaceIdColumn === true,
    hasWorkspaceMemberIdColumn: columns?.hasWorkspaceMemberIdColumn === true,
  };
};
