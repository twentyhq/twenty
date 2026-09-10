import {
  createServer,
  request,
  type IncomingHttpHeaders,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';

const SYNC_COLLECTION_REPORT_PATTERN =
  /<supported-report>\s*<report>\s*<sync-collection\s*\/>\s*<\/report>\s*<\/supported-report>/g;
const GETETAG_PATTERN =
  /<(?:[A-Za-z0-9]+:)?getetag>[^<]*<\/(?:[A-Za-z0-9]+:)?getetag>/g;
const GETLASTMODIFIED_PATTERN =
  /<(?:[A-Za-z0-9]+:)?getlastmodified>[^<]*<\/(?:[A-Za-z0-9]+:)?getlastmodified>/g;

export type EtaglessCalDavProxy = {
  host: string;
  port: number;
  stop: () => Promise<void>;
};

const withoutSyncCollectionAndChangeSignals = (body: string): string =>
  body
    .replace(SYNC_COLLECTION_REPORT_PATTERN, '')
    .replace(GETETAG_PATTERN, '<getetag />')
    .replace(GETLASTMODIFIED_PATTERN, '<getlastmodified />');

const readBody = (stream: IncomingMessage): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

const buildUpstreamHeaders = ({
  headers,
  upstreamAuthority,
  contentLength,
}: {
  headers: IncomingHttpHeaders;
  upstreamAuthority: string;
  contentLength: number;
}): IncomingHttpHeaders => {
  const upstreamHeaders: IncomingHttpHeaders = {
    ...headers,
    host: upstreamAuthority,
    'accept-encoding': 'identity',
    'content-length': String(contentLength),
  };

  delete upstreamHeaders['transfer-encoding'];

  return upstreamHeaders;
};

const buildDownstreamHeaders = ({
  headers,
  contentLength,
}: {
  headers: IncomingHttpHeaders;
  contentLength: number;
}): IncomingHttpHeaders => {
  const downstreamHeaders: IncomingHttpHeaders = {
    ...headers,
    'content-length': String(contentLength),
  };

  delete downstreamHeaders['transfer-encoding'];
  delete downstreamHeaders['content-encoding'];

  return downstreamHeaders;
};

const readListeningPort = (server: Server): number => {
  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('The CalDAV proxy is not listening on a TCP port');
  }

  return address.port;
};

const forwardRequest = async ({
  incomingRequest,
  serverResponse,
  upstreamHost,
  upstreamPort,
}: {
  incomingRequest: IncomingMessage;
  serverResponse: ServerResponse;
  upstreamHost: string;
  upstreamPort: number;
}): Promise<void> => {
  const requestBody = await readBody(incomingRequest);

  const upstreamRequest = request(
    {
      host: upstreamHost,
      port: upstreamPort,
      method: incomingRequest.method,
      path: incomingRequest.url,
      headers: buildUpstreamHeaders({
        headers: incomingRequest.headers,
        upstreamAuthority: `${upstreamHost}:${upstreamPort}`,
        contentLength: requestBody.length,
      }),
    },
    (upstreamResponse) => {
      readBody(upstreamResponse)
        .then((upstreamBody) => {
          const isXml = (
            upstreamResponse.headers['content-type'] ?? ''
          ).includes('xml');
          const responseBody = isXml
            ? Buffer.from(
                withoutSyncCollectionAndChangeSignals(
                  upstreamBody.toString('utf8'),
                ),
                'utf8',
              )
            : upstreamBody;

          serverResponse.writeHead(
            upstreamResponse.statusCode ?? 502,
            buildDownstreamHeaders({
              headers: upstreamResponse.headers,
              contentLength: responseBody.length,
            }),
          );
          serverResponse.end(responseBody);
        })
        .catch(() => serverResponse.destroy());
    },
  );

  upstreamRequest.on('error', () => serverResponse.destroy());
  upstreamRequest.end(requestBody);
};

export const startEtaglessCalDavProxy = async ({
  upstreamHost,
  upstreamPort,
}: {
  upstreamHost: string;
  upstreamPort: number;
}): Promise<EtaglessCalDavProxy> => {
  const server = createServer((incomingRequest, serverResponse) => {
    forwardRequest({
      incomingRequest,
      serverResponse,
      upstreamHost,
      upstreamPort,
    }).catch(() => serverResponse.destroy());
  });

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  return {
    host: '127.0.0.1',
    port: readListeningPort(server),
    stop: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
};
