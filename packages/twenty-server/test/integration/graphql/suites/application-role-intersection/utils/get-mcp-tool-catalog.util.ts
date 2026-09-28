import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';

export const getMcpToolCatalog = async ({
  token,
}: {
  token: string;
}): Promise<Record<string, { name: string }[]>> => {
  const result = await callMcpTool({ toolName: 'get_tool_catalog', token });

  expect(result.isError).toBe(false);

  return JSON.parse(result.content[0].text).catalog;
};
