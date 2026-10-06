import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentChatChannelTables = (workspaceId: string) => {
  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));

  return {
    channelTable: `${schema}."agentChatChannel"`,
    memberTable: `${schema}."agentChatChannelMember"`,
    recordShareTable: `${schema}."recordShare"`,
    workspaceMemberTable: `${schema}."workspaceMember"`,
  };
};
