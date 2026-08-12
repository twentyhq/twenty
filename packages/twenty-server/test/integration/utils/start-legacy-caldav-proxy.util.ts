import { createServer, request, type Server } from 'node:http';
import { type AddressInfo } from 'node:net';

export type LegacyCalDavProxy = {
  host: string;
  port: number;
  stop: () => Promise<void>;
};

// Servers that predate RFC 6578 omit sync-collection from their reported
// capabilities, which sends the driver down the ctag/etag path instead of an
// incremental sync. No maintained server still does this, so the capability is
// stripped from a current one rather than pinning an unmaintained image.
export const startLegacyCalDavProxy = async ({
  targetHost,
  targetPort,
}: {
  targetHost: string;
  targetPort: number;
}): Promise<LegacyCalDavProxy> => {
  const server: Server = createServer((clientRequest, clientResponse) => {
    const chunks: Buffer[] = [];

    clientRequest.on('data', (chunk: Buffer) => chunks.push(chunk));
    clientRequest.on('end', () => {
      const body = Buffer.concat(chunks);

      const proxyRequest = request(
        {
          host: targetHost,
          port: targetPort,
          method: clientRequest.method,
          path: clientRequest.url,
          headers: {
            ...clientRequest.headers,
            host: `${targetHost}:${targetPort}`,
            'content-length': String(body.length),
          },
        },
        (proxyResponse) => {
          const responseChunks: Buffer[] = [];

          proxyResponse.on('data', (chunk: Buffer) =>
            responseChunks.push(chunk),
          );
          proxyResponse.on('end', () => {
            const rewritten = Buffer.concat(responseChunks)
              .toString('utf8')
              .replace(/<[^>]*sync-collection\s*\/>/g, '');

            clientResponse.writeHead(proxyResponse.statusCode ?? 502, {
              ...proxyResponse.headers,
              'content-length': String(Buffer.byteLength(rewritten)),
            });
            clientResponse.end(rewritten);
          });
        },
      );

      proxyRequest.on('error', () => clientResponse.destroy());
      proxyRequest.end(body);
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    host: '127.0.0.1',
    port: (server.address() as AddressInfo).port,
    stop: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
};
