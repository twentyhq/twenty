import {
  makeMcpRequest,
  type McpToolCallResult,
} from 'test/integration/ai/suites/utils/make-mcp-request.util';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const executeToolThroughMcp = async <TResult = unknown>({
  toolName,
  toolArguments,
  token,
  expectToFail,
}: {
  toolName: string;
  toolArguments: Record<string, unknown>;
  token?: string;
  expectToFail: boolean;
}): Promise<ToolOutput<TResult>> => {
  const body = await makeMcpRequest({
    method: 'tools/call',
    params: {
      name: 'execute_tool',
      arguments: { toolName, arguments: toolArguments },
    },
    token,
  });

  expect(body.error).toBeUndefined();

  const result = body.result as McpToolCallResult;
  const output = JSON.parse(result.content[0].text) as ToolOutput<TResult>;

  expect({ isError: result.isError, output }).toMatchObject({
    isError: expectToFail,
  });

  return output;
};
