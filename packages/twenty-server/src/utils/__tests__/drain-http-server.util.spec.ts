import { once } from 'events';
import { createServer, type Server, type ServerResponse } from 'http';
import { type AddressInfo } from 'net';

import { drainHttpServer } from 'src/utils/drain-http-server.util';

const listen = async (server: Server): Promise<string> => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
};

describe('drainHttpServer', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it('lets an in-flight request finish without waiting for keep-alive to expire', async () => {
    let respond: (response: ServerResponse) => void = () => {};
    const responseReady = new Promise<ServerResponse>((resolve) => {
      respond = resolve;
    });
    const server = createServer((_request, response) => respond(response));

    server.keepAliveTimeout = 65_000;

    const url = await listen(server);
    const request = fetch(url, { method: 'POST', body: 'in-flight write' });
    const response = await responseReady;
    const drained = drainHttpServer(server, 30_000);

    await expect(fetch(url)).rejects.toThrow();

    response.end('write completed');

    expect(await (await request).text()).toBe('write completed');
    await drained;
  }, 3_000);

  it('cuts endless streams once the drain timeout elapses', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' });
      response.write('data: connected\n\n');
    });
    const response = await fetch(await listen(server));
    const bodyRejected = expect(response.text()).rejects.toThrow();

    await drainHttpServer(server, 50);
    await bodyRejected;
  });
});
