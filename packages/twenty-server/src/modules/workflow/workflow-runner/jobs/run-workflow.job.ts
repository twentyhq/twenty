import { Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

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

  @Process(RUN_WORKFLOW_JOB_NAME)
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

    await this.throttleExecution(workflowVersion.workflowId);

    await this.incrementTriggerMetrics({
      workflowRunId,
      triggerType: workflowVersion.trigger.type,
    });

    await this.workflowRunWorkspaceService.startWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    const stepIds = workflowVersion.trigger.nextStepIds ?? [];

    await this.workflowExecutorWorkspaceService.executeFromSteps({
      stepIds,
      workflowRunId,
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
      return;
    }

    const lastExecutedStep = workflowRun.state?.flow?.steps?.find(
      (step) => step.id === lastExecutedStepId,
    );

    if (!lastExecutedStep) {
      throw new WorkflowRunException(
        'Last executed step not found',
        WorkflowRunExceptionCode.INVALID_INPUT,
      );
    }

    const lastExecutedStepResult =
      workflowRun.state?.stepInfos[lastExecutedStepId]?.result;

    const nextStepIdsToExecute =
      await this.workflowExecutorWorkspaceService.getNextStepIdsToExecute({
        executedStep: lastExecutedStep,
        executedStepResult: lastExecutedStepResult,
      });

    if (!isDefined(nextStepIdsToExecute) || nextStepIdsToExecute.length === 0) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.COMPLETED,
      });

      return;
    }

    await this.workflowExecutorWorkspaceService.executeFromSteps({
      stepIds: nextStepIdsToExecute,
      workflowRunId,
      workspaceId,
    });
  }

  private async throttleExecution(workflowId: string) {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `${workflowId}-workflow-execution`,
        1,
        this.twentyConfigService.get('WORKFLOW_EXEC_THROTTLE_LIMIT'),
        this.twentyConfigService.get('WORKFLOW_EXEC_THROTTLE_TTL'),
      );
    } catch {
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
