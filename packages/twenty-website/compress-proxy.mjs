// Lighthouse-only helper: `vinext start` serves static assets uncompressed,
// while Cloudflare brotli-compresses them, so measuring the origin directly
// understates the deployed site by several seconds of transfer time.
import { createServer } from 'node:http';
import { brotliCompressSync, constants } from 'node:zlib';

const ORIGIN = 'http://localhost:3010';
const PORT = 3020;
const COMPRESSIBLE = /text|javascript|json|css|svg|xml/;

// Compressing on every request adds seconds across ~124 assets and shows up as
// origin latency in the measurement, so immutable build output is compressed
// once and reused.
const cache = new Map();

createServer(async (req, res) => {
  const cached = req.url.startsWith('/_next/') ? cache.get(req.url) : undefined;

  if (cached) {
    res.writeHead(cached.status, cached.headers);
    res.end(cached.body);

    return;
  }

  const upstream = await fetch(ORIGIN + req.url, {
    headers: { ...req.headers, host: new URL(ORIGIN).host, 'accept-encoding': 'identity' },
    redirect: 'manual',
  });

  const body = Buffer.from(await upstream.arrayBuffer());
  const headers = {};

  upstream.headers.forEach((value, key) => {
    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
      headers[key] = value;
    }
  });

  const type = upstream.headers.get('content-type') ?? '';
  const wantsBrotli = (req.headers['accept-encoding'] ?? '').includes('br');

  if (wantsBrotli && COMPRESSIBLE.test(type) && body.length > 512) {
    const compressed = brotliCompressSync(body, {
      params: { [constants.BROTLI_PARAM_QUALITY]: 5 },
    });

    const sent = {
      status: upstream.status,
      headers: {
        ...headers,
        'content-encoding': 'br',
        'content-length': compressed.length,
      },
      body: compressed,
    };

    if (req.url.startsWith('/_next/')) cache.set(req.url, sent);

    res.writeHead(sent.status, sent.headers);
    res.end(sent.body);

    return;
  }

  const sent = {
    status: upstream.status,
    headers: { ...headers, 'content-length': body.length },
    body,
  };

  if (req.url.startsWith('/_next/')) cache.set(req.url, sent);

  res.writeHead(sent.status, sent.headers);
  res.end(sent.body);
}).listen(PORT, () => console.log('compressing proxy on ' + PORT));
