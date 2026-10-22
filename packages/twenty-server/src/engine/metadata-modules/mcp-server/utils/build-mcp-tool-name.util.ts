export const MCP_TOOL_NAME_PREFIX = 'mcp';

export const buildMcpToolName = ({
  mcpServerName,
  toolName,
}: {
  mcpServerName: string;
  toolName: string;
}): string => `${MCP_TOOL_NAME_PREFIX}_${mcpServerName}_${toolName}`;
