import request from 'supertest';

export type McpToolCallResult = {
  content: { type: string; text: string }[];
  isError: boolean;
};

export type McpJsonRpcResponseBody = {
  jsonrpc: '2.0';
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
};

export const makeMcpRequest = async ({
  method,
  params,
  token = API_KEY_ACCESS_TOKEN,
}: {
  method: 'tools/list' | 'tools/call';
  params?: Record<string, unknown>;
  token?: string;
}): Promise<McpJsonRpcResponseBody> => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }))
    .expect(200);

  return response.body;
};
