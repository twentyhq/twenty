import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-history/types/tool-call-workflow-step.type';
import { AwaitedToolCallHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-tool-call-answer/services/awaited-tool-call-handler-registry.service';
import {
  type AwaitedToolCallHandler,
  type AwaitedToolCallWaiter,
} from 'src/engine/metadata-modules/ai/ai-tool-call-answer/types/awaited-tool-call-handler.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Injectable()
export class WorkflowAwaitedToolCallHandlerWorkspaceService
  implements AwaitedToolCallHandler, OnModuleInit
{
  constructor(
    private readonly registry: AwaitedToolCallHandlerRegistryService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async findWaiter({
    workspaceId,
    threadId,
    workflowStep: { workflowRunId, stepId },
  }: {
    workspaceId: string;
    threadId: string;
    workflowStep: ToolCallWorkflowStep;
  }): Promise<AwaitedToolCallWaiter> {
    try {
      return await this.findWaiterOfExistingRun({
        workspaceId,
        threadId,
        workflowRunId,
        stepId,
      });
    } catch (error) {
      if (
        error instanceof WorkflowRunException &&
        error.code === WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND
      ) {
        return { status: 'gone' };
      }

      throw error;
    }
  }

  private async findWaiterOfExistingRun({
    workspaceId,
    threadId,
    workflowRunId,
    stepId,
  }: {
    workspaceId: string;
    threadId: string;
    workflowRunId: string;
    stepId: string;
  }): Promise<AwaitedToolCallWaiter> {
    const step = await this.workflowRunWorkspaceService.findStepAwaitingAnswer({
      threadId,
      workflowRunId,
      workspaceId,
      expectedStepId: stepId,
    });

    if (isDefined(step)) {
      return {
        status: 'ready',
        resume: (toolResult) =>
          this.workflowRunnerWorkspaceService.resumeAnsweredStep({
            workspaceId,
            workflowRunId,
            step,
            threadId,
            toolResult,
          }),
      };
    }

    const isStepStillRunning =
      await this.workflowRunWorkspaceService.isStepStillRunning({
        stepId,
        threadId,
        workflowRunId,
        workspaceId,
      });

    return { status: isStepStillRunning ? 'not_ready' : 'gone' };
  }

  async failWaiter({
    workspaceId,
    workflowStep: { workflowRunId },
  }: {
    workspaceId: string;
    workflowStep: ToolCallWorkflowStep;
  }): Promise<void> {
    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.FAILED,
      error: 'The run could not resume after its question was answered',
    });
  }
}
