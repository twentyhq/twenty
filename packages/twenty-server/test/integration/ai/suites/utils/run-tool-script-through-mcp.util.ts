import {
  makeMcpRequest,
  type McpToolCallResult,
} from 'test/integration/ai/suites/utils/make-mcp-request.util';

import { type RunToolScriptOutput } from 'src/engine/core-modules/tool-provider/tools/run-tool-script.tool';

export const runToolScriptThroughMcp = async ({
  code,
  token,
  expectToFail,
}: {
  code: string;
  token?: string;
  expectToFail: boolean;
}): Promise<RunToolScriptOutput> => {
  const body = await makeMcpRequest({
    method: 'tools/call',
    params: { name: 'run_tool_script', arguments: { code } },
    token,
  });

  expect(body.error).toBeUndefined();

  const result = body.result as McpToolCallResult;
  const output = JSON.parse(result.content[0].text) as RunToolScriptOutput;

  expect({ isError: result.isError, output }).toMatchObject({
    isError: expectToFail,
  });

  return output;
};
