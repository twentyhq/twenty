import http from 'http';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

export type FakeMcpServer = {
  url: string;
  receivedAuthorizationHeaders: (string | undefined)[];
  close: () => Promise<void>;
};

export const FAKE_MCP_TOOL_NAME = 'search_docs';
export const FAKE_MCP_TOOL_DESCRIPTION = 'Search the fake documentation';

// Stateless per the MCP spec: every request gets its own server and transport
const buildMcpServer = () => {
  const mcpServer = new McpServer({
    name: 'fake-mcp-server',
    version: '1.0.0',
  });

  mcpServer.registerTool(
    FAKE_MCP_TOOL_NAME,
    {
      description: FAKE_MCP_TOOL_DESCRIPTION,
      inputSchema: { query: z.string() },
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => ({
      content: [{ type: 'text', text: `Results for ${query}` }],
    }),
  );

  return mcpServer;
};

export const startFakeMcpServer = (port: number): Promise<FakeMcpServer> =>
  new Promise((resolve) => {
    const receivedAuthorizationHeaders: (string | undefined)[] = [];

    const handleRequest = async (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      receivedAuthorizationHeaders.push(request.headers.authorization);

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      response.on('close', () => {
        transport.close().catch(() => undefined);
      });

      await buildMcpServer().connect(transport);
      await transport.handleRequest(request, response);
    };

    const httpServer = http.createServer((request, response) => {
      handleRequest(request, response).catch(() => {
        response.writeHead(500).end();
      });
    });

    httpServer.listen(port, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${port}/mcp`,
        receivedAuthorizationHeaders,
        close: () =>
          new Promise<void>((resolveClose) => {
            httpServer.closeAllConnections();
            httpServer.close(() => resolveClose());
          }),
      });
    });
  });
