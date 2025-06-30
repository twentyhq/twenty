import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
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
import { getRootSteps } from 'src/modules/workflow/workflow-runner/utils/get-root-steps.utils';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowRunId: string;
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
    private readonly metricsService: MetricsService,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
  ) {}

  @Process(RunWorkflowJob.name)
  async handle({
    workflowRunId,
    lastExecutedStepId,
    workspaceId,
  }: RunWorkflowJobData): Promise<void> {
    try {
      if (lastExecutedStepId) {
        await this.resumeWorkflowExecution({
          workspaceId,
          workflowRunId,
          lastExecutedStepId,
        });
      } else {
        await this.startWorkflowExecution({
          workflowRunId,
          workspaceId,
        });
      }
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workspaceId,
        workflowRunId,
        status: WorkflowRunStatus.FAILED,
        error: error.message,
      });
    } finally {
      await this.workflowRunQueueWorkspaceService.decreaseWorkflowRunQueuedCount(
        workspaceId,
      );
    }
  }

  private async startWorkflowExecution({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<void> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workspaceId,
        workflowVersionId: workflowRun.workflowVersionId,
      });

    if (!workflowVersion.trigger || !workflowVersion.steps) {
      throw new WorkflowRunException(
        'Workflow version has no trigger or steps',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    await this.incrementTriggerMetrics({
      workflowRunId,
      triggerType: workflowVersion.trigger.type,
    });

    const triggerPayload = workflowRun.context?.trigger ?? {};

    await this.workflowRunWorkspaceService.startWorkflowRun({
      workflowRunId,
      workspaceId,
      output: {
        flow: {
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        },
        stepsOutput: {
          trigger: {
            result: triggerPayload,
          },
        },
      },
    });

    await this.throttleExecution(workflowVersion.workflowId);

    const rootSteps = getRootSteps(workflowVersion.steps);

    await this.executeWorkflow({
      workflowRunId,
      currentStepId: rootSteps[0].id,
      steps: workflowVersion.steps,
      context: workflowRun.context ?? {
        trigger: triggerPayload,
      },
      workspaceId,
    });
  }

  private async resumeWorkflowExecution({
    workflowRunId,
    lastExecutedStepId,
    workspaceId,
  }: {
    workflowRunId: string;
    lastExecutedStepId: string;
    workspaceId: string;
  }): Promise<void> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

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
        workspaceId,
        status: WorkflowRunStatus.COMPLETED,
      });

      return;
    }

    await this.executeWorkflow({
      workflowRunId,
      currentStepId: nextStepId,
      steps: workflowRun.output?.flow?.steps ?? [],
      context: workflowRun.context ?? {},
      workspaceId,
    });
  }

  private async executeWorkflow({
    workflowRunId,
    currentStepId,
    steps,
    context,
    workspaceId,
  }: {
    workflowRunId: string;
    currentStepId: string;
    steps: WorkflowAction[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
    workspaceId: string;
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
      workspaceId,
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
      await this.metricsService.incrementCounter({
        key: MetricsKeys.WorkflowRunFailedThrottled,
        eventId: workflowId,
      });

      throw new WorkflowRunException(
        'Workflow execution rate limit exceeded',
        WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED,
      );
    }
  }

  private async incrementTriggerMetrics({
    workflowRunId,
    triggerType,
  }: {
    workflowRunId: string;
    triggerType: string;
  }) {
    let key: MetricsKeys;

    switch (triggerType) {
      case WorkflowTriggerType.DATABASE_EVENT:
        key = MetricsKeys.WorkflowRunStartedDatabaseEventTrigger;
        break;
      case WorkflowTriggerType.CRON:
        key = MetricsKeys.WorkflowRunStartedCronTrigger;
        break;
      case WorkflowTriggerType.WEBHOOK:
        key = MetricsKeys.WorkflowRunStartedWebhookTrigger;
        break;
      case WorkflowTriggerType.MANUAL:
        key = MetricsKeys.WorkflowRunStartedManualTrigger;
        break;
      default:
        throw new Error('Invalid trigger type');
    }

    await this.metricsService.incrementCounter({
      key,
      eventId: workflowRunId,
    });
  }
}
