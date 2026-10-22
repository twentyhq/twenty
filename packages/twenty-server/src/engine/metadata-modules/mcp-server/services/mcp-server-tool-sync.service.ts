import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { sanitizeMcpServerTools } from 'src/engine/metadata-modules/mcp-server/utils/sanitize-mcp-server-tools.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ToolsSyncUpdate = Pick<
  QueryDeepPartialEntity<McpServerEntity>,
  'tools' | 'toolsSyncedAt' | 'toolsSyncError'
>;

@Injectable()
export class McpServerToolSyncService {
  private readonly logger = new Logger(McpServerToolSyncService.name);

  constructor(
    @InjectWorkspaceScopedRepository(McpServerEntity)
    private readonly mcpServerRepository: WorkspaceScopedRepository<McpServerEntity>,
    private readonly mcpServerClientService: McpServerClientService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Never throws: a server that cannot be reached is recorded in toolsSyncError
  async syncTools({
    mcpServerId,
    workspaceId,
  }: {
    mcpServerId: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: mcpServerId,
      flatEntityMaps: flatMcpServerMaps,
    });

    if (!isDefined(flatMcpServer)) {
      return;
    }

    const update = await this.fetchToolsUpdate(flatMcpServer);

    await this.mcpServerRepository.update(
      workspaceId,
      { id: mcpServerId },
      update,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatMcpServerMaps',
    ]);
  }

  private async fetchToolsUpdate(
    flatMcpServer: FlatMcpServer,
  ): Promise<ToolsSyncUpdate> {
    try {
      const remoteTools =
        await this.mcpServerClientService.listTools(flatMcpServer);

      const { tools, skippedToolNames } = sanitizeMcpServerTools({
        remoteTools,
        mcpServerName: flatMcpServer.name,
      });

      if (skippedToolNames.length > 0) {
        this.logger.warn(
          `MCP server ${flatMcpServer.name} (${flatMcpServer.id}) exposes tools whose names cannot be offered: ${skippedToolNames.join(', ')}`,
        );
      }

      return {
        tools: tools as QueryDeepPartialEntity<McpServerEntity>['tools'],
        toolsSyncedAt: new Date(),
        toolsSyncError: null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown sync error';

      this.logger.warn(
        `Could not list tools of MCP server ${flatMcpServer.name} (${flatMcpServer.id}): ${message}`,
      );

      return { toolsSyncError: message };
    }
  }
}
