import { once } from 'events';
import { createServer, type Server, type ServerResponse } from 'http';
import { connect } from 'net';
import { type Duplex } from 'stream';

import { isDefined } from 'twenty-shared/utils';

import { drainHttpServer } from 'src/utils/drain-http-server.util';

const servers: Server[] = [];
const sockets: Duplex[] = [];

const listen = async (server: Server): Promise<string> => {
  servers.push(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();

  if (!isDefined(address) || typeof address === 'string') {
    throw new Error('Expected an HTTP server listening on a TCP port');
  }

  return `http://127.0.0.1:${address.port}`;
};

describe('drainHttpServer', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  afterEach(async () => {
    for (const socket of sockets.splice(0)) {
      socket.destroy();
    }

    for (const server of servers.splice(0)) {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
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
    const drained = drainHttpServer({ server, drainTimeoutMs: 30_000 });

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

    await drainHttpServer({ server, drainTimeoutMs: 50 });
    await bodyRejected;
  });

  it('stops waiting at the deadline for sockets the HTTP layer no longer tracks', async () => {
    const server = createServer();

    server.on('upgrade', (_request, socket) => {
      sockets.push(socket);
      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: test\r\n\r\n',
      );
    });

    const url = new URL(await listen(server));
    const client = connect(Number(url.port), url.hostname);

    sockets.push(client);

    const upgraded = once(client, 'data');

    client.write(
      'GET / HTTP/1.1\r\nHost: localhost\r\nConnection: Upgrade\r\nUpgrade: test\r\n\r\n',
    );
    await upgraded;

    await drainHttpServer({ server, drainTimeoutMs: 50 });
  }, 3_000);
});
