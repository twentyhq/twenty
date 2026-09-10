import { once } from 'node:events';
import { createServer, request, type IncomingMessage } from 'node:http';
import { type AddressInfo } from 'node:net';

const PROXY_HOST = '127.0.0.1';

const ENTITY_TAG_PATTERN =
  /<((?:[\w.-]+:)?)getetag(?:\s[^>]*)?>[\s\S]*?<\/\1getetag>/g;
const LAST_MODIFIED_PATTERN =
  /<((?:[\w.-]+:)?)getlastmodified(?:\s[^>]*)?>[\s\S]*?<\/\1getlastmodified>/g;
const SUPPORTED_REPORT_PATTERN =
  /<((?:[\w.-]+:)?)supported-report>[\s\S]*?<\/\1supported-report>/g;
const RESPONSE_PATTERN = /<((?:[\w.-]+:)?)response>[\s\S]*?<\/\1response>/g;
const HREF_PATTERN = /<(?:[\w.-]+:)?href>\s*([^<]*?)\s*<\/(?:[\w.-]+:)?href>/;

export type NonCompliantCalDavProxy = {
  host: string;
  port: number;
  degradations: {
    blankLastModified: boolean;
    hideCollectionMembers: boolean;
  };
  stop: () => Promise<void>;
};

const readBody = async (message: IncomingMessage): Promise<Buffer> => {
  const chunks: Buffer[] = [];

  for await (const chunk of message) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks);
};

const blankEntityTags = (body: string): string =>
  body.replace(ENTITY_TAG_PATTERN, '<$1getetag />');

const blankLastModified = (body: string): string =>
  body.replace(LAST_MODIFIED_PATTERN, '<$1getlastmodified />');

const dropSyncCollectionReport = (body: string): string =>
  body.replace(SUPPORTED_REPORT_PATTERN, (report) =>
    report.includes('sync-collection') ? '' : report,
  );

const dropMemberResponses = (body: string): string =>
  body.replace(RESPONSE_PATTERN, (response) =>
    HREF_PATTERN.exec(response)?.[1].endsWith('/') ? response : '',
  );

export const startNonCompliantCalDavProxy = async ({
  targetHost,
  targetPort,
}: {
  targetHost: string;
  targetPort: number;
}): Promise<NonCompliantCalDavProxy> => {
  const degradations = {
    blankLastModified: false,
    hideCollectionMembers: false,
  };

  const server = createServer((incoming, outgoing) => {
    void readBody(incoming)
      .then((requestBody) => {
        const upstream = request(
          {
            host: targetHost,
            port: targetPort,
            method: incoming.method,
            path: incoming.url,
            headers: {
              ...incoming.headers,
              host: `${targetHost}:${targetPort}`,
            },
          },
          (upstreamResponse) => {
            void readBody(upstreamResponse)
              .then((responseBody) => {
                const headers = { ...upstreamResponse.headers };

                delete headers['content-length'];
                delete headers['transfer-encoding'];

                const isXml = String(headers['content-type'] ?? '').includes(
                  'xml',
                );
                const rewrites = [blankEntityTags, dropSyncCollectionReport];

                if (degradations.blankLastModified) {
                  rewrites.push(blankLastModified);
                }

                if (
                  degradations.hideCollectionMembers &&
                  incoming.method === 'PROPFIND'
                ) {
                  rewrites.push(dropMemberResponses);
                }

                outgoing.writeHead(upstreamResponse.statusCode ?? 502, headers);
                outgoing.end(
                  isXml
                    ? rewrites.reduce(
                        (body, rewrite) => rewrite(body),
                        responseBody.toString('utf8'),
                      )
                    : responseBody,
                );
              })
              .catch(() => outgoing.destroy());
          },
        );

        upstream.on('error', () => outgoing.destroy());
        upstream.end(requestBody);
      })
      .catch(() => outgoing.destroy());
  });

  server.listen(0, PROXY_HOST);
  await once(server, 'listening');

  return {
    host: PROXY_HOST,
    port: (server.address() as AddressInfo).port,
    degradations,
    stop: async () => {
      server.closeAllConnections();
      server.close();
      await once(server, 'close');
    },
  };
};
