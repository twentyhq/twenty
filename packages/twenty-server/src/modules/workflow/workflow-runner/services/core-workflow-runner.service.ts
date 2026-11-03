import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { buildWorkflowRunCreatedBy } from 'src/modules/workflow/workflow-executor/utils/build-workflow-run-created-by.util';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class CoreWorkflowRunnerService {
  private readonly logger = new Logger(CoreWorkflowRunnerService.name);

  constructor(
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workflowRunJobScopeWorkspaceService: WorkflowRunJobScopeWorkspaceService,
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

    const workspaceWorkflowVersionId =
      workflowVersion.workspaceWorkflowVersionId ??
      (isDefined(workflow?.workspaceWorkflowId)
        ? await this.workflowVersionCoreSyncService.findWorkspaceVersionIdByCoreVersionId(
            workspaceId,
            workflowVersion.id,
          )
        : null);

    if (
      !isDefined(workflow) ||
      workflowVersion.workflowId !== workflow.workspaceWorkflowId
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

    const createdWorkflowRunId =
      await this.workflowRunWorkspaceService.createCoreWorkflowRun({
        coreWorkflowId: workflow.id,
        coreWorkflowVersionId: workflowVersion.id,
        workspaceWorkflowId: workflow.workspaceWorkflowId,
        workspaceWorkflowVersionId,
        workflowName: workflow.name,
        trigger: workflowVersion.triggers[0],
        steps: workflowVersion.steps,
        createdBy: buildWorkflowRunCreatedBy({
          source,
          workflowApplicationId: workflow.applicationId,
        }),
        workflowRunId,
        status: WorkflowRunStatus.ENQUEUED,
        triggerPayload: payload,
        workspaceId,
      });

    await this.messageQueueService.add<RunWorkflowJobData>(
      RunWorkflowJob.name,
      { workspaceId, workflowRunId: createdWorkflowRunId },
      buildRunWorkflowJobOptions({
        workflowRunId: createdWorkflowRunId,
        scope:
          await this.workflowRunJobScopeWorkspaceService.resolveForApplication({
            workspaceId,
            applicationId: workflow.applicationId,
          }),
      }),
    );

    return { workflowRunId: createdWorkflowRunId };
  }
}
