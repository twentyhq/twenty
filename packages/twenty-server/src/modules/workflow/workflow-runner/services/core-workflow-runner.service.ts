import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import {
  WorkflowRunEnqueueJob,
  type WorkflowRunEnqueueJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-run-enqueue.job';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class CoreWorkflowRunnerService {
  private readonly logger = new Logger(CoreWorkflowRunnerService.name);

  constructor(
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly metricsService: MetricsService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async run({
    workspaceId,
    coreWorkflowVersionId,
    payload,
    source,
    workflowRunId,
  }: {
    workspaceId: string;
    coreWorkflowVersionId: string;
    payload: object;
    source: ActorMetadata;
    workflowRunId?: string;
  }) {
    const workflowVersion =
      await this.workflowVersionCoreSyncService.findCoreVersionById(
        workspaceId,
        coreWorkflowVersionId,
      );

    if (
      !isDefined(workflowVersion) ||
      !isDefined(workflowVersion.coreWorkflowId) ||
      !isDefined(workflowVersion.triggers?.[0]) ||
      !isDefined(workflowVersion.steps)
    ) {
      throw new WorkflowRunException(
        'Core workflow version is missing its execution definition',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const workflow = await this.workflowCoreSyncService.findCoreWorkflowById(
      workspaceId,
      workflowVersion.coreWorkflowId,
    );

    if (
      !isDefined(workflow) ||
      workflowVersion.workflowId !== workflow.workspaceWorkflowId ||
      isDefined(workflow.workspaceWorkflowId) !==
        isDefined(workflowVersion.workspaceWorkflowVersionId)
    ) {
      throw new WorkflowRunException(
        'Core workflow not found',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const subscriptionInactiveReason =
      await this.billingUsageService.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      this.logger.log(
        `Cannot execute billed function for this workspace: ${subscriptionInactiveReason}`,
      );
    }

    const isHardThrottled = await this.checkHardThrottleLimit(workspaceId);
    const isManualTrigger =
      workflowVersion.triggers[0].type === WorkflowTriggerType.MANUAL;
    const status = isHardThrottled
      ? WorkflowRunStatus.FAILED
      : isManualTrigger
        ? WorkflowRunStatus.ENQUEUED
        : WorkflowRunStatus.NOT_STARTED;
    const createdWorkflowRunId =
      await this.workflowRunWorkspaceService.createCoreWorkflowRun({
        coreWorkflowId: workflow.id,
        coreWorkflowVersionId: workflowVersion.id,
        workspaceWorkflowId: workflow.workspaceWorkflowId,
        workspaceWorkflowVersionId: workflowVersion.workspaceWorkflowVersionId,
        workflowName: workflow.name,
        trigger: workflowVersion.triggers[0],
        steps: workflowVersion.steps,
        createdBy: source,
        workflowRunId,
        status,
        triggerPayload: payload,
        error: isHardThrottled ? 'Throttle limit reached' : undefined,
        workspaceId,
      });

    if (isHardThrottled) {
      return { workflowRunId: createdWorkflowRunId };
    }

    if (isManualTrigger) {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RunWorkflowJob.name,
        { workspaceId, workflowRunId: createdWorkflowRunId },
        buildRunWorkflowJobOptions(createdWorkflowRunId),
      );
    } else {
      await this.workflowThrottlingWorkspaceService.increaseWorkflowRunNotStartedCount(
        workspaceId,
      );
      await this.messageQueueService.add<WorkflowRunEnqueueJobData>(
        WorkflowRunEnqueueJob.name,
        { workspaceId, isCacheMode: true },
      );
    }

    return { workflowRunId: createdWorkflowRunId };
  }

  private async checkHardThrottleLimit(workspaceId: string): Promise<boolean> {
    try {
      await this.workflowThrottlingWorkspaceService.throttleOrThrowIfHardLimitReached(
        workspaceId,
      );

      return false;
    } catch {
      void this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.WorkflowRunThrottled,
        eventId: workspaceId,
      });

      return true;
    }
  }
}
