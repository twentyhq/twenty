// Lighthouse-only harness. `vinext start` serves assets uncompressed over
// HTTP/1.1, so measuring it directly charges the app for both the missing
// brotli and the 6-connection limit. Cloudflare serves brotli over h2/h3, and
// this build requests ~124 files, so HTTP/1.1 queuing alone cost seconds of
// first paint. This mirrors production transport instead.
import { readFileSync } from 'node:fs';
import { createSecureServer } from 'node:http2';
import { brotliCompressSync, constants } from 'node:zlib';

const ORIGIN = 'http://localhost:3010';
const PORT = 3021;
const COMPRESSIBLE = /text|javascript|json|css|svg|xml/;
const cache = new Map();

const server = createSecureServer({
  key: readFileSync('/tmp/lh-key.pem'),
  cert: readFileSync('/tmp/lh-cert.pem'),
  allowHTTP1: true,
});

server.on('stream', async (stream, headers) => {
  const path = headers[':path'];

  try {
    const cached = path.startsWith('/_next/') ? cache.get(path) : undefined;

    if (cached) {
      stream.respond(cached.headers);
      stream.end(cached.body);

      return;
    }

    const upstream = await fetch(ORIGIN + path, {
      headers: { 'accept-encoding': 'identity' },
      redirect: 'manual',
    });
    const raw = Buffer.from(await upstream.arrayBuffer());
    const type = upstream.headers.get('content-type') ?? 'application/octet-stream';

    const compressible = COMPRESSIBLE.test(type) && raw.length > 512;
    const body = compressible
      ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } })
      : raw;

    const responseHeaders = {
      ':status': upstream.status,
      'content-type': type,
      'content-length': body.length,
      ...(compressible ? { 'content-encoding': 'br' } : {}),
      ...(upstream.headers.get('location')
        ? { location: upstream.headers.get('location') }
        : {}),
    };

    if (path.startsWith('/_next/')) {
      cache.set(path, { headers: responseHeaders, body });
    }

    stream.respond(responseHeaders);
    stream.end(body);
  } catch {
    if (!stream.closed) {
      stream.respond({ ':status': 502 });
      stream.end();
    }
  }
});

server.listen(PORT, () => console.log('h2 proxy on https://localhost:' + PORT));
