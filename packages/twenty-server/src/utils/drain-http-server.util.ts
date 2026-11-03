import { type Server } from 'http';

const HTTP_SERVER_DRAIN_TIMEOUT_MS = 60_000;
const IDLE_CONNECTIONS_CLOSE_INTERVAL_MS = 1_000;

export const drainHttpServer = async ({
  server,
  drainTimeoutMs = HTTP_SERVER_DRAIN_TIMEOUT_MS,
}: {
  server: Server;
  drainTimeoutMs?: number;
}): Promise<void> => {
  // Requests in flight at close() still reply keep-alive, leaving sockets open until keepAliveTimeout.
  const closeIdleConnectionsInterval = setInterval(
    () => server.closeIdleConnections(),
    IDLE_CONNECTIONS_CLOSE_INTERVAL_MS,
  );

  await new Promise<void>((resolve) => {
    // closeAllConnections() misses sockets mid TLS handshake or upgraded, so stop waiting on them too.
    const drainTimeout = setTimeout(() => {
      server.closeAllConnections();
      resolve();
    }, drainTimeoutMs);

    server.close(() => {
      clearTimeout(drainTimeout);
      resolve();
    });
  });

  clearInterval(closeIdleConnectionsInterval);
};
