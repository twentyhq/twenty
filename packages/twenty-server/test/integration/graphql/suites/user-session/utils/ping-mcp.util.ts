import request from 'supertest';

export const pingMcp = async ({ token }: { token: string }) => {
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify({ jsonrpc: '2.0', method: 'ping', id: 'ping' }));

  return { status: response.status, body: response.body };
};
