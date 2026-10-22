import request from 'supertest';

// Direct mode lists every registry tool with its input schema, unlike get_tool_catalog
export const listDirectModeMcpToolNames = async ({
  token,
}: {
  token: string;
}): Promise<string[]> => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp?mode=direct')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', id: 1 }))
    .expect(200);

  const tools: { name: string }[] = response.body.result.tools;

  return tools.map(({ name }) => name);
};
