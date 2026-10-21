import { connect, createServer, type Socket } from 'node:net';

import { isDefined } from 'twenty-shared/utils';

const ENABLE_IMAP4REV2_COMMAND = /\bENABLE\b.*\bIMAP4rev2\b/i;
const SEARCH_COMMAND = /^(\S+) (UID )?SEARCH\b/i;
const SEARCH_RESPONSE = /^\* E?SEARCH\b/i;
const COMPRESS_CAPABILITY = / COMPRESS=DEFLATE\b/g;

type SearchCommand = {
  tag: string;
  isUid: boolean;
};

export type ImapProxy = {
  host: string;
  port: number;
  stop: () => Promise<void>;
};

const emptyEsearchResponse = ({ tag, isUid }: SearchCommand) =>
  `* ESEARCH (TAG "${tag}")${isUid ? ' UID' : ''}`;

export const startImapProxyEmptyingRev2Search = async ({
  targetHost,
  targetPort,
}: {
  targetHost: string;
  targetPort: number;
}): Promise<ImapProxy> => {
  const sockets = new Set<Socket>();

  const server = createServer((client) => {
    const upstream = connect(targetPort, targetHost);
    let isRev2Enabled = false;
    let lastSearchCommand: SearchCommand | undefined;
    let pendingClientText = '';
    let pendingServerText = '';

    sockets.add(client);
    sockets.add(upstream);

    client.on('data', (chunk) => {
      const lines = (pendingClientText + chunk.toString('latin1')).split(
        '\r\n',
      );

      pendingClientText = lines.pop() ?? '';

      for (const line of lines) {
        if (ENABLE_IMAP4REV2_COMMAND.test(line)) {
          isRev2Enabled = true;
        }

        const searchCommand = line.match(SEARCH_COMMAND);

        if (isDefined(searchCommand)) {
          lastSearchCommand = {
            tag: searchCommand[1],
            isUid: isDefined(searchCommand[2]),
          };
        }
      }

      upstream.write(chunk);
    });

    upstream.on('data', (chunk) => {
      const lines = (pendingServerText + chunk.toString('latin1')).split(
        '\r\n',
      );

      pendingServerText = lines.pop() ?? '';

      const forwarded = lines
        .map((line) => line.replace(COMPRESS_CAPABILITY, ''))
        .map((line) =>
          isRev2Enabled &&
          isDefined(lastSearchCommand) &&
          SEARCH_RESPONSE.test(line)
            ? emptyEsearchResponse(lastSearchCommand)
            : line,
        )
        .map((line) => `${line}\r\n`)
        .join('');

      client.write(forwarded, 'latin1');
    });

    client.on('close', () => upstream.destroy());
    upstream.on('close', () => client.destroy());
    client.on('error', () => upstream.destroy());
    upstream.on('error', () => client.destroy());
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!isDefined(address) || typeof address === 'string') {
    throw new Error('IMAP proxy is not listening on a TCP port');
  }

  return {
    host: '127.0.0.1',
    port: address.port,
    stop: () =>
      new Promise<void>((resolve) => {
        sockets.forEach((socket) => socket.destroy());
        server.close(() => resolve());
      }),
  };
};
