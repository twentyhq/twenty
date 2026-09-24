import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';

// Database tools are only reachable through the execute_tool wrapper, which
// rebuilds the auth context the blocklist settings check reads.
export const deleteBlocklistEntryThroughMcp = ({
  blocklistEntryId,
  token,
}: {
  blocklistEntryId: string;
  token: string;
}) =>
  callMcpTool({
    toolName: 'execute_tool',
    toolArguments: {
      toolName: 'delete_one_blocklist',
      arguments: { id: blocklistEntryId },
    },
    token,
  });
