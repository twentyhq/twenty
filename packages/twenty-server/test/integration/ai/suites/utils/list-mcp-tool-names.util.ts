import { makeMcpRequest } from 'test/integration/ai/suites/utils/make-mcp-request.util';

export const listMcpToolNames = async ({
  token,
}: {
  token?: string;
} = {}): Promise<string[]> => {
  const body = await makeMcpRequest({ method: 'tools/list', token });

  expect(body.error).toBeUndefined();

  const tools = body.result?.tools as { name: string }[];

  return tools.map((tool) => tool.name);
};
