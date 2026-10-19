import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const executeToolThroughMcp = async <TResult = object>({
  toolName,
  toolArguments,
}: {
  toolName: string;
  toolArguments: Record<string, unknown>;
}): Promise<ToolOutput<TResult>> => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: `call-${randomUUID()}`,
        params: {
          name: 'execute_tool',
          arguments: { toolName, arguments: toolArguments },
        },
      }),
    )
    .expect(200);

  const text = response.body.result?.content?.[0]?.text;

  jestExpectToBeDefined(text);

  return JSON.parse(text) as ToolOutput<TResult>;
};
