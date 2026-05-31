import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

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
  ) {}

  async computeStats(workspaceId: string): Promise<WorkspaceAiStatsDTO> {
    const [conversationsCount, flatMaps] = await Promise.all([
      this.threadRepository.count(workspaceId),
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatSkillMaps', 'flatLogicFunctionMaps'],
      }),
    ]);

    const skillsCount = Object.values(
      flatMaps.flatSkillMaps.byUniversalIdentifier,
    ).filter(isDefined).length;

    const toolsCount = Object.values(
      flatMaps.flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (logicFunction) =>
        isDefined(logicFunction) &&
        isDefined(logicFunction.toolTriggerSettings) &&
        !isDefined(logicFunction.deletedAt),
    ).length;

    return { conversationsCount, skillsCount, toolsCount };
  }
}
