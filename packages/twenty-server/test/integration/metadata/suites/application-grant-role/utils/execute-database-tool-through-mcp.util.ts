import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';

type DatabaseToolPayload = {
  success: boolean;
  message: string;
  result?: unknown;
  error?: string;
};

export const executeDatabaseToolThroughMcp = async ({
  toolName,
  toolArguments,
  token,
}: {
  toolName: string;
  toolArguments: object;
  token: string;
}): Promise<{ isError: boolean; payload: DatabaseToolPayload }> => {
  const { content, isError } = await callMcpTool({
    toolName: 'execute_tool',
    toolArguments: { toolName, arguments: toolArguments },
    token,
  });

  return { isError, payload: JSON.parse(content[0].text) };
};
