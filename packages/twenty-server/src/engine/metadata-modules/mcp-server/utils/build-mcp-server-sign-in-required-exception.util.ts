import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';

// Lands in toolsSyncError, which settings show as is.
export const buildMcpServerSignInRequiredException = (): McpServerException =>
  new McpServerException(
    'This MCP server requires signing in. Connect an account to use it.',
    McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED,
  );
