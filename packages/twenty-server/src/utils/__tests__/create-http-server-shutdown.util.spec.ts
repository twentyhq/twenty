import { once } from 'events';
import { createServer, type Server, type ServerResponse } from 'http';
import { connect } from 'net';

import { isDefined } from 'twenty-shared/utils';

import { createHttpServerShutdown } from 'src/utils/create-http-server-shutdown.util';

const listen = async (server: Server): Promise<string> => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();

  if (!isDefined(address) || typeof address === 'string') {
    throw new Error('Expected a TCP server address');
  }

  return `http://127.0.0.1:${address.port}`;
};

describe('createHttpServerShutdown', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it('finishes an active POST while refusing new connections', async () => {
    let completeResponse: (response: ServerResponse) => void = () => {};
    const requestReceived = new Promise<ServerResponse>((resolve) => {
      completeResponse = resolve;
    });
    const server = createServer((_request, response) => {
      completeResponse(response);
    });
    const shutdown = createHttpServerShutdown(server);
    const url = await listen(server);

    try {
      const request = fetch(url, { method: 'POST', body: 'in-flight write' });
      const response = await requestReceived;
      const firstShutdown = shutdown();
      const secondShutdown = shutdown();

      await expect(fetch(url)).rejects.toThrow();

      response.end('write completed');

      expect(await (await request).text()).toBe('write completed');
      await Promise.all([firstShutdown, secondShutdown]);
    } finally {
      server.closeAllConnections();
      await shutdown();
    }
  });

  it('bounds an endless HTTP stream instead of waiting forever', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/event-stream' });
      response.write('data: connected\n\n');
    });
    const shutdown = createHttpServerShutdown(server, 50);
    const url = await listen(server);

    try {
      const response = await fetch(url);
      const body = response.text();
      const bodyRejected = expect(body).rejects.toThrow();

      await shutdown();
      await bodyRejected;
    } finally {
      server.closeAllConnections();
      await shutdown();
    }
  });

  it('also bounds upgraded connections', async () => {
    const server = createServer();
    const shutdown = createHttpServerShutdown(server, 50);
    const url = new URL(await listen(server));

    server.on('upgrade', (_request, connection) => {
      connection.write(
        'HTTP/1.1 101 Switching Protocols\r\nConnection: Upgrade\r\nUpgrade: test\r\n\r\n',
      );
    });

    const connection = connect(Number(url.port), url.hostname);

    try {
      const upgraded = once(connection, 'data');

      connection.write(
        'GET / HTTP/1.1\r\nHost: localhost\r\nConnection: Upgrade\r\nUpgrade: test\r\n\r\n',
      );
      await upgraded;

      const disconnected = once(connection, 'close');

      await shutdown();
      await disconnected;
    } finally {
      connection.destroy();
      await shutdown();
    }
  });

  it('can stop a server that has not started listening', async () => {
    const server = createServer();

    await expect(createHttpServerShutdown(server)()).resolves.toBeUndefined();
  });
});
