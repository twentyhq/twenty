import { createServer } from 'node:http';

import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { isDefined } from 'twenty-shared/utils';

// Logic functions cannot write outside their execution directory, so tests observe them over HTTP.
export const startMarkerServer = async (): Promise<MarkerServer> => {
  const markers = new Map<string, string>();

  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      const name = request.url ?? '/';

      markers.set(
        name,
        (markers.get(name) ?? '') + Buffer.concat(chunks).toString(),
      );
      response.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!isDefined(address) || typeof address === 'string') {
    throw new Error('Marker server is not listening on a TCP port');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const toName = (markerUrl: string) => new URL(markerUrl).pathname;

  return {
    markerUrl: (name) => `${baseUrl}/${name}`,
    hasMarker: (markerUrl) => markers.has(toName(markerUrl)),
    readMarker: (markerUrl) => {
      const marker = markers.get(toName(markerUrl));

      if (!isDefined(marker)) {
        throw new Error(`No request was received for marker ${markerUrl}`);
      }

      return marker;
    },
    clearMarker: (markerUrl) => {
      markers.delete(toName(markerUrl));
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
