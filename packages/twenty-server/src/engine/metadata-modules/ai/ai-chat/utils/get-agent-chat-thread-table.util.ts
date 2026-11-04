import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentChatThreadTable = (workspaceId: string) =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier('agentChatThread')}`;
