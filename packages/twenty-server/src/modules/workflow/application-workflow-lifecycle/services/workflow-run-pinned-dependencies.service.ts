import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkflowExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-execution-dependencies.type';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';
import { computeWorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-workflow-run-pinned-dependencies.util';
import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';
import { hasPinnedDependencyChanged } from 'src/modules/workflow/application-workflow-lifecycle/utils/has-pinned-dependency-changed.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowRunPinnedDependenciesService {
  constructor(
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async pinDependencies({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowRunPinnedDependencies> {
    return this.computeCurrentDependencies({
      workspaceId,
      dependencies: getWorkflowStepsExecutionDependencies(steps),
    });
  }

  async assertStepDependenciesUnchanged({
    workspaceId,
    step,
    pinnedDependencies,
  }: {
    workspaceId: string;
    step: WorkflowAction;
    pinnedDependencies?: WorkflowRunPinnedDependencies;
  }): Promise<void> {
    if (!isDefined(pinnedDependencies)) {
      return;
    }

    const dependencies = getWorkflowStepsExecutionDependencies([step]);

    if (
      dependencies.logicFunctionIds.length === 0 &&
      dependencies.agentIds.length === 0
    ) {
      return;
    }

    const currentDependencies = await this.computeCurrentDependencies({
      workspaceId,
      dependencies,
    });

    if (
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies,
        currentDependencies,
      })
    ) {
      throw new WorkflowStepExecutorException(
        `The application changed or removed what step "${step.name}" runs after this run started. Start a new run to use the current version.`,
        WorkflowStepExecutorExceptionCode.EXECUTION_DEPENDENCY_CHANGED,
      );
    }
  }

  private async computeCurrentDependencies({
    workspaceId,
    dependencies: { logicFunctionIds, agentIds },
  }: {
    workspaceId: string;
    dependencies: WorkflowExecutionDependencies;
  }): Promise<WorkflowRunPinnedDependencies> {
    const [logicFunctions, agents] = await Promise.all([
      logicFunctionIds.length > 0
        ? this.logicFunctionRepository.find(workspaceId, {
            where: { id: In(logicFunctionIds) },
            select: {
              id: true,
              checksum: true,
              handlerName: true,
              runtime: true,
              workflowActionTriggerSettings: true,
            },
          })
        : [],
      agentIds.length > 0
        ? this.agentRepository.find(workspaceId, {
            where: { id: In(agentIds) },
            select: {
              id: true,
              prompt: true,
              modelId: true,
              responseFormat: true,
              modelConfiguration: true,
            },
          })
        : [],
    ]);

    return computeWorkflowRunPinnedDependencies({ logicFunctions, agents });
  }
}
