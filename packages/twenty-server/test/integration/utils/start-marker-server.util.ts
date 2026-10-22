import { createServer } from 'node:http';

import { isDefined } from 'twenty-shared/utils';

// Logic functions cannot write outside their execution directory, so tests observe them over HTTP.
export type MarkerServer = {
  markerUrl: (name: string) => string;
  hasMarker: (markerUrl: string) => boolean;
  readMarker: (markerUrl: string) => string;
  clearMarker: (markerUrl: string) => void;
  close: () => Promise<void>;
};

export const startMarkerServer = async (): Promise<MarkerServer> => {
  const markers = new Map<string, string>();

  const server = createServer((request, response) => {
    let body = '';

    request.on('data', (chunk: Buffer) => (body += chunk.toString()));
    request.on('end', () => {
      const name = request.url ?? '/';

      markers.set(name, (markers.get(name) ?? '') + body);
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
    readMarker: (markerUrl) => markers.get(toName(markerUrl)) ?? '',
    clearMarker: (markerUrl) => {
      markers.delete(toName(markerUrl));
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
