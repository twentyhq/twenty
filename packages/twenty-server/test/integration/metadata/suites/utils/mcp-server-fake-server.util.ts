import {
  createFakeOAuthServer,
  type FakeOAuthServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-oauth-server.util';
import http from 'http';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

export type FakeMcpServer = {
  url: string;
  receivedAuthorizationHeaders: (string | undefined)[];
  stopOfferingSearchDocs: () => void;
  startRequiringSignIn: () => void;
  oauth: FakeOAuthServer;
  close: () => Promise<void>;
};

type FakeMcpServerState = {
  isSearchDocsOffered: boolean;
  isDeletePageOffered: boolean;
};

const createMcpServer = ({
  isSearchDocsOffered,
  isDeletePageOffered,
}: FakeMcpServerState): McpServer => {
  const mcpServer = new McpServer({ name: 'fake', version: '1.0.0' });

  if (isSearchDocsOffered) {
    mcpServer.registerTool(
      'search_docs',
      {
        description: 'Search the documentation',
        inputSchema: { query: z.string() },
        annotations: { readOnlyHint: true },
      },
      async ({ query }) => ({
        content: [{ type: 'text', text: `results for ${query}` }],
      }),
    );
  }

  if (isDeletePageOffered) {
    mcpServer.registerTool(
      'delete_page',
      {
        description: 'Delete a documentation page',
        inputSchema: { pageId: z.string() },
        annotations: { destructiveHint: true },
      },
      async ({ pageId }) => ({
        content: [{ type: 'text', text: `deleted ${pageId}` }],
      }),
    );
  }
  mcpServer.registerTool(
    'docs.search',
    { description: 'Dropped by the sanitizer' },
    async () => ({ content: [] }),
  );

  return mcpServer;
};

// A stateless transport is single-use, so every request gets its own server and transport.
const handleMcpRequest = async ({
  request,
  response,
  state,
}: {
  request: http.IncomingMessage;
  response: http.ServerResponse;
  state: FakeMcpServerState;
}): Promise<void> => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await createMcpServer(state).connect(transport);
  await transport.handleRequest(request, response);
};

export const startFakeMcpServer = ({
  isDeletePageOffered = false,
  isSignInRequired = false,
}: {
  isDeletePageOffered?: boolean;
  isSignInRequired?: boolean;
} = {}): Promise<FakeMcpServer> =>
  new Promise((resolve, reject) => {
    const receivedAuthorizationHeaders: (string | undefined)[] = [];
    const state: FakeMcpServerState = {
      isSearchDocsOffered: true,
      isDeletePageOffered,
    };
    const fakeOAuthServer = createFakeOAuthServer();
    let baseUrl = '';
    let isSignInRequiredNow = isSignInRequired;

    const handleRequest = async (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ): Promise<void> => {
      if (
        isSignInRequiredNow &&
        (await fakeOAuthServer.handleRequest({ request, response, baseUrl }))
      ) {
        return;
      }

      receivedAuthorizationHeaders.push(request.headers.authorization);

      if (
        isSignInRequiredNow &&
        !fakeOAuthServer.isAuthorized(request.headers.authorization)
      ) {
        response
          .writeHead(401, {
            'WWW-Authenticate': `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource/mcp", scope="docs:read"`,
          })
          .end();

        return;
      }

      await handleMcpRequest({ request, response, state });
    };

    const server = http.createServer((request, response) => {
      handleRequest(request, response).catch(() => {
        response.writeHead(500).end();
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!isDefined(address) || isString(address)) {
        reject(new Error('Fake MCP server did not bind to a TCP port'));

        return;
      }

      baseUrl = `http://127.0.0.1:${address.port}`;

      resolve({
        url: `${baseUrl}/mcp`,
        receivedAuthorizationHeaders,
        oauth: fakeOAuthServer.state,
        stopOfferingSearchDocs: () => {
          state.isSearchDocsOffered = false;
        },
        startRequiringSignIn: () => {
          isSignInRequiredNow = true;
        },
        close: () =>
          new Promise((resolveClose) => {
            server.closeAllConnections();
            server.close(() => resolveClose());
          }),
      });
    });
  });
