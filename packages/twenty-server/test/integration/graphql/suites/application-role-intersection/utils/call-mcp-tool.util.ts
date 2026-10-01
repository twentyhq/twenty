import request from 'supertest';

// The MCP endpoint speaks JSON-RPC over REST, so it gets its own util rather
// than going through the GraphQL helpers.
export const callMcpTool = async ({
  toolName,
  toolArguments = {},
  token,
}: {
  toolName: string;
  toolArguments?: object;
  token: string;
}): Promise<{
  content: { type: string; text: string }[];
  isError: boolean;
}> => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: toolArguments },
        id: 1,
      }),
    )
    .expect(200);

  if (response.body.result === undefined) {
    throw new Error(
      `MCP tools/call returned no result: ${JSON.stringify(response.body)}`,
    );
  }

  return response.body.result;
};
