import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { WorkspaceAiStatsDTO } from 'src/engine/metadata-modules/ai/ai-workspace-stats/dtos/workspace-ai-stats.dto';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Injectable()
export class AiWorkspaceStatsService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async computeStats(workspaceId: string): Promise<WorkspaceAiStatsDTO> {
    const [conversationsCount, flatMaps, aiWorkflowsCount] = await Promise.all([
      this.threadRepository.count(workspaceId),
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatSkillMaps', 'flatLogicFunctionMaps'],
      }),
      this.countWorkflowsLinkedToAgent(workspaceId),
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

    return {
      conversationsCount,
      skillsCount,
      toolsCount,
      aiWorkflowsCount,
    };
  }

  // A workflow is "linked to an Agent" when at least one of its versions has a
  // step of type AI_AGENT whose settings.input.agentId points at an agent.
  // Scaffolded AI_AGENT steps without an agentId are excluded.
  private async countWorkflowsLinkedToAgent(
    workspaceId: string,
  ): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const versions = await workflowVersionRepository.find({
          select: ['workflowId', 'steps'],
        });

        const workflowIdsLinkedToAgent = new Set<string>();
        for (const version of versions) {
          if (!Array.isArray(version.steps)) continue;
          const hasAgentStep = version.steps.some(
            (step: WorkflowAction) =>
              step?.type === WorkflowActionType.AI_AGENT &&
              isAgentStepLinked(step),
          );
          if (hasAgentStep) {
            workflowIdsLinkedToAgent.add(version.workflowId);
          }
        }

        return workflowIdsLinkedToAgent.size;
      },
      authContext,
    );
  }
}

const isAgentStepLinked = (step: WorkflowAction): boolean => {
  if (step.type !== WorkflowActionType.AI_AGENT) return false;
  const agentId = step.settings?.input?.agentId;
  return typeof agentId === 'string' && agentId.length > 0;
};
