import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentChatThreadParticipantTable = (workspaceId: string) =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier('agentChatThreadParticipant')}`;
