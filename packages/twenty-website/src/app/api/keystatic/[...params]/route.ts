import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

const { GET: _GET, POST: _POST } = makeRouteHandler({ config });

function rewriteUrl(request: Request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedPort = request.headers.get('x-forwarded-port');

  if (forwardedHost && forwardedProto) {
    const url = new URL(request.url);

    url.hostname = forwardedHost;
    url.protocol = forwardedProto;
    url.port = forwardedPort ?? '';

    return new Request(url, request);
  }

  return request;
}

export function GET(request: Request) {
  return _GET(rewriteUrl(request));
}

export function POST(request: Request) {
  return _POST(rewriteUrl(request));
}
