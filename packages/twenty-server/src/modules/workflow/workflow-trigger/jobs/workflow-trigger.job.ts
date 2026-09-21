import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';
import {
  type QueuedWorkflowTriggerDispatchIds,
  resolveWorkflowTriggerDispatchMode,
} from 'src/modules/workflow/workflow-trigger/utils/resolve-workflow-trigger-dispatch-mode.util';

export type WorkflowTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
} & QueuedWorkflowTriggerDispatchIds;

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowTriggerJob {
  private readonly logger = new Logger(WorkflowTriggerJob.name);
  constructor(
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly metricsService: MetricsService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    const dispatchMode = resolveWorkflowTriggerDispatchMode(data);

    if (dispatchMode.mode === 'CORE') {
      return this.handleFromCore({
        workflowId: data.workflowId,
        workspaceId: data.workspaceId,
        coreWorkflowVersionId: dispatchMode.coreWorkflowVersionId,
        workspaceWorkflowVersionId: dispatchMode.workspaceWorkflowVersionId,
        payload: data.payload,
      });
    }

    return this.handleLegacyDispatch(data);
  }

  private async handleFromCore({
    workflowId,
    workspaceId,
    coreWorkflowVersionId,
    workspaceWorkflowVersionId,
    payload,
  }: {
    workflowId: string;
    workspaceId: string;
    coreWorkflowVersionId: string;
    workspaceWorkflowVersionId?: string;
    payload: object;
  }): Promise<void> {
    const coreWorkflowVersion =
      await this.workflowVersionCoreSyncService.findCoreVersionById(
        workspaceId,
        coreWorkflowVersionId,
      );

    if (!isDefined(coreWorkflowVersion)) {
      const diagnostic = await this.describeMissingCoreVersion({
        workspaceId,
        workflowId,
        workspaceWorkflowVersionId,
      });

      await this.captureDroppedDispatch({
        workspaceId,
        workflowId,
        message: `Core workflow version ${coreWorkflowVersionId} not found in workspace ${workspaceId}. ${diagnostic}`,
      });

      return;
    }

    const coreWorkflow =
      await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
        workspaceId,
        workflowId,
      );

    if (
      !isDefined(coreWorkflow) ||
      coreWorkflowVersion.coreWorkflowId !== coreWorkflow.id
    ) {
      await this.captureDroppedDispatch({
        workspaceId,
        workflowId,
        message: `Core workflow version ${coreWorkflowVersionId} does not belong to workflow ${workflowId} in workspace ${workspaceId}`,
      });
      return;
    }

    if (coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE) {
      await this.captureDroppedDispatch({
        workspaceId,
        workflowId,
        message: `Core workflow version ${coreWorkflowVersionId} is not active in workspace ${workspaceId}`,
      });
      return;
    }

    if (
      isDefined(workspaceWorkflowVersionId) &&
      coreWorkflowVersion.workspaceWorkflowVersionId !==
        workspaceWorkflowVersionId
    ) {
      await this.captureDroppedDispatch({
        workspaceId,
        workflowId,
        message: `Workspace version ${workspaceWorkflowVersionId} conflicts with core version ${coreWorkflowVersionId} in workspace ${workspaceId}`,
      });
      return;
    }

    await this.coreWorkflowRunnerService.run({
      workspaceId,
      coreWorkflowVersionId,
      payload,
      source: buildWorkflowRunSource(coreWorkflow.name),
    });
  }

  private async handleLegacyDispatch(
    data: WorkflowTriggerJobData,
  ): Promise<void> {
    const coreWorkflow =
      await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
        data.workspaceId,
        data.workflowId,
      );
    const coreWorkflowVersionId = isDefined(data.workspaceWorkflowVersionId)
      ? (
          await this.workflowVersionCoreSyncService.findCoreVersionByWorkspaceVersionId(
            data.workspaceId,
            data.workspaceWorkflowVersionId,
          )
        )?.id
      : coreWorkflow?.lastPublishedCoreWorkflowVersionId;

    if (!isDefined(coreWorkflowVersionId)) {
      await this.captureDroppedDispatch({
        workspaceId: data.workspaceId,
        workflowId: data.workflowId,
        message: `Legacy workflow trigger for ${data.workflowId} has no core version mapping in workspace ${data.workspaceId}`,
      });
      return;
    }

    await this.handleFromCore({
      workflowId: data.workflowId,
      workspaceId: data.workspaceId,
      coreWorkflowVersionId,
      workspaceWorkflowVersionId: data.workspaceWorkflowVersionId ?? undefined,
      payload: data.payload,
    });
  }

  private async describeMissingCoreVersion({
    workspaceId,
    workflowId,
    workspaceWorkflowVersionId,
  }: {
    workspaceId: string;
    workflowId: string;
    workspaceWorkflowVersionId?: string;
  }): Promise<string> {
    const coreWorkflow =
      await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
        workspaceId,
        workflowId,
      );

    if (!isDefined(coreWorkflow)) {
      return 'core workflow not found either';
    }

    const publishedCoreWorkflowVersionId =
      coreWorkflow.lastPublishedCoreWorkflowVersionId;

    if (!isDefined(publishedCoreWorkflowVersionId)) {
      return `core workflow ${coreWorkflow.id} publishes no version, workspace twin ${workspaceWorkflowVersionId ?? 'none'}`;
    }

    const publishedVersionExists = isDefined(
      await this.workflowVersionCoreSyncService.findCoreVersionById(
        workspaceId,
        publishedCoreWorkflowVersionId,
      ),
    );

    return `core workflow ${coreWorkflow.id} publishes ${publishedCoreWorkflowVersionId} which ${publishedVersionExists ? 'exists' : 'is missing too'}, workspace twin ${workspaceWorkflowVersionId ?? 'none'}`;
  }

  private async captureDroppedDispatch({
    workspaceId,
    workflowId,
    message,
  }: {
    workspaceId: string;
    workflowId: string;
    message: string;
  }): Promise<void> {
    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([new Error(message)]);

    await this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.WorkflowTriggerDispatchDropped,
      eventId: `${workspaceId}:${workflowId}`,
    });
  }
}
