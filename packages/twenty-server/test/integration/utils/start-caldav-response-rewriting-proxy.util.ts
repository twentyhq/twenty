import {
  createServer,
  type IncomingHttpHeaders,
  request,
  type Server,
} from 'node:http';
import { type AddressInfo } from 'node:net';

export type CalDavProxy = {
  url: string;
  stop: () => Promise<void>;
};

export const startCalDavResponseRewritingProxy = async ({
  targetHost,
  targetPort,
  rewriteResponseBody,
  rewriteResponseHeaders = (headers) => headers,
}: {
  targetHost: string;
  targetPort: number;
  rewriteResponseBody: (body: string) => string;
  rewriteResponseHeaders?: (
    headers: IncomingHttpHeaders,
  ) => IncomingHttpHeaders;
}): Promise<CalDavProxy> => {
  const server: Server = createServer((incoming, outgoing) => {
    const requestChunks: Buffer[] = [];

    incoming.on('data', (chunk) => requestChunks.push(chunk));
    incoming.on('end', () => {
      const proxied = request(
        {
          host: targetHost,
          port: targetPort,
          path: incoming.url,
          method: incoming.method,
          headers: {
            ...incoming.headers,
            host: `${targetHost}:${targetPort}`,
            'accept-encoding': 'identity',
          },
        },
        (upstream) => {
          const responseChunks: Buffer[] = [];

          upstream.on('data', (chunk) => responseChunks.push(chunk));
          upstream.on('end', () => {
            const body = rewriteResponseBody(
              Buffer.concat(responseChunks).toString('utf-8'),
            );

            const {
              'content-length': _staleContentLength,
              'transfer-encoding': _staleTransferEncoding,
              ...headers
            } = upstream.headers;

            outgoing.writeHead(upstream.statusCode ?? 502, {
              ...rewriteResponseHeaders(headers),
              'content-length': Buffer.byteLength(body),
            });
            outgoing.end(body);
          });
        },
      );

      proxied.on('error', () => outgoing.destroy());
      proxied.end(Buffer.concat(requestChunks));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
