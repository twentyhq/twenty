import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowRunId: string;
  payload?: object;
  lastExecutedStepId?: string;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class RunWorkflowJob {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowExecutorWorkspaceService: WorkflowExecutorWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Process(RunWorkflowJob.name)
  async handle({
    workflowRunId,
    payload,
    lastExecutedStepId,
  }: RunWorkflowJobData): Promise<void> {
    try {
      if (lastExecutedStepId) {
        await this.resumeWorkflowExecution({
          workflowRunId,
          lastExecutedStepId,
        });
      } else {
        await this.startWorkflowExecution({
          workflowRunId,
          payload: payload ?? {},
        });
      }
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        status: WorkflowRunStatus.FAILED,
        error: error.message,
      });
    }
  }

  private async startWorkflowExecution({
    workflowRunId,
    payload,
  }: {
    workflowRunId: string;
    payload: object;
  }): Promise<void> {
    const context = {
      trigger: payload,
    };

    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail(
        workflowRunId,
      );

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowRun.workflowVersionId,
      );

    if (!workflowVersion.trigger || !workflowVersion.steps) {
      throw new WorkflowRunException(
        'Workflow version has no trigger or steps',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    await this.workflowRunWorkspaceService.startWorkflowRun({
      workflowRunId,
      context,
      output: {
        flow: {
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        },
        stepsOutput: {
          trigger: {
            result: payload,
          },
        },
      },
    });

    await this.throttleExecution(workflowVersion.workflowId);

    await this.executeWorkflow({
      workflowRunId,
      currentStepId: workflowVersion.steps[0].id,
      steps: workflowVersion.steps,
      context,
    });
  }

  private async resumeWorkflowExecution({
    workflowRunId,
    lastExecutedStepId,
  }: {
    workflowRunId: string;
    lastExecutedStepId: string;
  }): Promise<void> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail(
        workflowRunId,
      );

    if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
      throw new WorkflowRunException(
        'Workflow is not running',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const lastExecutedStep = workflowRun.output?.flow?.steps?.find(
      (step) => step.id === lastExecutedStepId,
    );

    if (!lastExecutedStep) {
      throw new WorkflowRunException(
        'Last executed step not found',
        WorkflowRunExceptionCode.INVALID_INPUT,
      );
    }

    const nextStepId = lastExecutedStep.nextStepIds?.[0];

    if (!nextStepId) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        status: WorkflowRunStatus.COMPLETED,
      });

      return;
    }

    await this.executeWorkflow({
      workflowRunId,
      currentStepId: nextStepId,
      steps: workflowRun.output?.flow?.steps ?? [],
      context: workflowRun.context ?? {},
    });
  }

  private async executeWorkflow({
    workflowRunId,
    currentStepId,
    steps,
    context,
  }: {
    workflowRunId: string;
    currentStepId: string;
    steps: WorkflowAction[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
  }) {
    const { error, pendingEvent } =
      await this.workflowExecutorWorkspaceService.execute({
        workflowRunId,
        currentStepId,
        steps,
        context,
      });

    if (pendingEvent) {
      return;
    }

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      status: error ? WorkflowRunStatus.FAILED : WorkflowRunStatus.COMPLETED,
      error,
    });
  }

  private async throttleExecution(workflowId: string) {
    try {
      await this.throttlerService.throttle(
        `${workflowId}-workflow-execution`,
        this.twentyConfigService.get('WORKFLOW_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('WORKFLOW_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new WorkflowRunException(
        'Workflow execution rate limit exceeded',
        WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED,
      );
    }
  }
}
