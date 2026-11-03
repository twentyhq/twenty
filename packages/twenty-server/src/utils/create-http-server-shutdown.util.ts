import { type Server } from 'http';
import { type Socket } from 'net';

const HTTP_SERVER_DRAIN_TIMEOUT_MS = 60_000;

export const createHttpServerShutdown = (
  server: Server,
  drainTimeoutMs = HTTP_SERVER_DRAIN_TIMEOUT_MS,
): (() => Promise<void>) => {
  const connections = new Set<Socket>();

  server.on('connection', (connection) => {
    connections.add(connection);
    connection.once('close', () => connections.delete(connection));
  });

  let shutdownPromise: Promise<void> | undefined;

  return () => {
    shutdownPromise ??= new Promise<void>((resolve) => {
      // Streams and upgraded connections can otherwise prevent shutdown forever.
      const drainTimeout = setTimeout(() => {
        for (const connection of connections) {
          connection.destroy();
        }
      }, drainTimeoutMs);

      drainTimeout.unref();

      server.close(() => {
        clearTimeout(drainTimeout);
        resolve();
      });
    });

    return shutdownPromise;
  };
};
