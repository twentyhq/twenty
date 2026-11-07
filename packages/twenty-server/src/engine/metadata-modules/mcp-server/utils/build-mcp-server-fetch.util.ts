import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

// The SDK reads SSE from a WHATWG Response, which the axios client yields whatever globalThis.fetch is.
export const buildMcpServerFetch = ({
  secureHttpClientService,
  workspaceId,
  timeoutMs,
}: {
  secureHttpClientService: SecureHttpClientService;
  workspaceId: string;
  timeoutMs: number;
}): FetchLike => {
  const axiosFetch = buildAxiosFetch(
    secureHttpClientService.getHttpClient(
      { timeout: timeoutMs },
      { workspaceId, source: 'mcp-server' },
    ),
    (config, _input, init) =>
      init?.redirect === 'manual' ? { ...config, maxRedirects: 0 } : config,
  );

  return (url, init) => axiosFetch(url.toString(), init);
};
