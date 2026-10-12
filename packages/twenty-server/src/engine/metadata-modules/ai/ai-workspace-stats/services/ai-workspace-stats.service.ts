import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

@Injectable()
export class AiWorkspaceStatsService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
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
      // the full role-scoped catalog, to match the Tools tab
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
