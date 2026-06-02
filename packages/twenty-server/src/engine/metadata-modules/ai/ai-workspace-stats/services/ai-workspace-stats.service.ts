import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AiWorkspaceStatsService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly toolRegistryService: ToolRegistryService,
  ) {}

  async computeStats(
    workspaceId: string,
    roleId: string,
  ): Promise<WorkspaceAiStatsDTO> {
    const [conversationsCount, flatMaps, toolIndex] = await Promise.all([
      this.threadRepository.count(workspaceId),
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatSkillMaps'],
      }),
      // Count the full tool catalog the user can see (built-in tools + custom
      // logic-function tools), matching the Tools tab rather than only the
      // custom subset. The catalog is role-scoped, like the tab.
      this.toolRegistryService.buildToolIndex(workspaceId, roleId),
    ]);

    const skillsCount = Object.values(
      flatMaps.flatSkillMaps.byUniversalIdentifier,
    ).filter(isDefined).length;

    return {
      conversationsCount,
      skillsCount,
      toolsCount: toolIndex.length,
    };
  }
}
