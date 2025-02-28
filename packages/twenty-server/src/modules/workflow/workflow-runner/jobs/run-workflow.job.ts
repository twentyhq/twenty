import { Scope } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
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
    private readonly environmentService: EnvironmentService,
    private readonly twentyORMManager: TwentyORMManager,
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
      },
    });

    await this.throttleExecution(workflowVersion.workflowId);

    await this.executeWorkflow({
      workflowRunId,
      currentStepIndex: 0,
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

    const lastExecutedStepIndex = workflowRun.output?.flow?.steps?.findIndex(
      (step) => step.id === lastExecutedStepId,
    );

    if (lastExecutedStepIndex === undefined) {
      throw new WorkflowRunException(
        'Last executed step not found',
        WorkflowRunExceptionCode.INVALID_INPUT,
      );
    }

    await this.executeWorkflow({
      workflowRunId,
      currentStepIndex: lastExecutedStepIndex + 1,
      steps: workflowRun.output?.flow?.steps ?? [],
      context: workflowRun.context ?? {},
    });
  }

  private async executeWorkflow({
    workflowRunId,
    currentStepIndex,
    steps,
    context,
  }: {
    workflowRunId: string;
    currentStepIndex: number;
    steps: WorkflowAction[];
    context: Record<string, any>;
  }) {
    const { error, pendingEvent } =
      await this.workflowExecutorWorkspaceService.execute({
        workflowRunId,
        currentStepIndex,
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
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_LIMIT'),
        this.environmentService.get('WORKFLOW_EXEC_THROTTLE_TTL'),
      );
    } catch (error) {
      throw new WorkflowRunException(
        'Workflow execution rate limit exceeded',
        WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED,
      );
    }
  }
}
