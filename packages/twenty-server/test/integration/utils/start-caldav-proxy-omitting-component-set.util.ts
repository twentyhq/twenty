import { createServer, request, type Server } from 'node:http';
import { type AddressInfo } from 'node:net';

// The self-closing form has to be matched on its own: sharing a branch with the
// open tag lets a self-closing occurrence pair up with a later closing tag and
// swallow every response in between.
const COMPONENT_SET_ELEMENT =
  /<(\w+:)?supported-calendar-component-set\b[^>]*\/>|<(\w+:)?supported-calendar-component-set\b[^>]*>[\s\S]*?<\/(\w+:)?supported-calendar-component-set>/g;

export type CalDavProxy = {
  url: string;
  stop: () => Promise<void>;
};

// Radicale always publishes supported-calendar-component-set, so reproducing an
// RFC 4791 server that leaves it out means stripping it off the wire.
export const startCalDavProxyOmittingComponentSet = async ({
  targetHost,
  targetPort,
}: {
  targetHost: string;
  targetPort: number;
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
            const body = Buffer.concat(responseChunks)
              .toString('utf-8')
              .replace(COMPONENT_SET_ELEMENT, '');

            const {
              'content-length': _staleContentLength,
              'transfer-encoding': _staleTransferEncoding,
              ...headers
            } = upstream.headers;

            outgoing.writeHead(upstream.statusCode ?? 502, {
              ...headers,
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
