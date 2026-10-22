// App-declared servers share the app_ namespace of logic function tools; hand-added ones use mcp_
export const MCP_TOOL_NAME_PREFIX = 'mcp';
export const APPLICATION_MCP_TOOL_NAME_PREFIX = 'app';

export const buildMcpToolName = ({
  mcpServerName,
  toolName,
  isApplicationOwned = false,
}: {
  mcpServerName: string;
  toolName: string;
  isApplicationOwned?: boolean;
}): string =>
  `${isApplicationOwned ? APPLICATION_MCP_TOOL_NAME_PREFIX : MCP_TOOL_NAME_PREFIX}_${mcpServerName}_${toolName}`;
