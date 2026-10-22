import { isDefined } from 'twenty-shared/utils';

import { type FlatMcpServerMaps } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server-maps.type';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { buildMcpToolName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-tool-name.util';

// Server and tool names both allow underscores, so the prefixed name is matched, never split
export const findMcpServerToolByToolName = ({
  flatMcpServerMaps,
  toolName,
}: {
  flatMcpServerMaps: FlatMcpServerMaps;
  toolName: string;
}): { flatMcpServer: FlatMcpServer; tool: McpServerTool } | undefined => {
  for (const flatMcpServer of Object.values(
    flatMcpServerMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatMcpServer) || !flatMcpServer.isEnabled) {
      continue;
    }

    const tool = flatMcpServer.tools.find(
      (candidate) =>
        buildMcpToolName({
          mcpServerName: flatMcpServer.name,
          toolName: candidate.name,
        }) === toolName,
    );

    if (isDefined(tool)) {
      return { flatMcpServer, tool };
    }
  }

  return undefined;
};
