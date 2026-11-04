import { Injectable, Logger } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { sanitizeMcpServerTool } from 'src/engine/metadata-modules/mcp-server/utils/sanitize-mcp-server-tool.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const SYNC_ERROR_MAX_LENGTH = 500;

type McpServerToSync = Pick<
  FlatMcpServer,
  'id' | 'workspaceId' | 'url' | 'connectionProviderId'
> & {
  userWorkspaceId?: string;
  shouldDiscardToolsOnFailure?: boolean;
};

@Injectable()
export class McpServerToolSyncService {
  private readonly logger = new Logger(McpServerToolSyncService.name);

  constructor(
    private readonly mcpServerClientService: McpServerClientService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectWorkspaceScopedRepository(McpServerEntity)
    private readonly mcpServerRepository: WorkspaceScopedRepository<McpServerEntity>,
  ) {}

  // Never throws: an unreachable server must not block saving its settings, the reason lands in toolsSyncError.
  async syncTools(mcpServer: McpServerToSync): Promise<void> {
    const { id, workspaceId, shouldDiscardToolsOnFailure = false } = mcpServer;

    try {
      const tools = await this.fetchSanitizedTools(mcpServer);

      await this.mcpServerRepository.update(
        workspaceId,
        { id },
        { tools, toolsSyncedAt: new Date(), toolsSyncError: null },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown MCP server error';

      this.logger.warn(
        `Failed to sync tools of MCP server ${id} in workspace ${workspaceId}: ${message}`,
      );

      await this.mcpServerRepository.update(
        workspaceId,
        { id },
        {
          toolsSyncError: message.slice(0, SYNC_ERROR_MAX_LENGTH),
          ...(shouldDiscardToolsOnFailure && {
            tools: [],
            toolsSyncedAt: null,
          }),
        },
      );
    }

    await this.workspaceManyOrAllFlatEntityMapsCacheService.invalidateFlatEntityMaps(
      { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
    );
  }

  private async fetchSanitizedTools(
    mcpServer: McpServerToSync,
  ): Promise<McpServerTool[]> {
    const remoteTools = await this.mcpServerClientService.listTools(mcpServer);
    const sanitizedTools = remoteTools.map(sanitizeMcpServerTool);
    const droppedToolNames = remoteTools
      .filter((_remoteTool, index) => !isDefined(sanitizedTools[index]))
      .map(({ name }) => name);

    if (isNonEmptyArray(droppedToolNames)) {
      this.logger.warn(
        `Dropped ${droppedToolNames.length} invalid tool(s) of MCP server ${mcpServer.id}: ${JSON.stringify(droppedToolNames)}`,
      );
    }

    return sanitizedTools.filter(isDefined);
  }
}
