import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
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
      this.captureDroppedDispatch(
        `Core workflow version ${coreWorkflowVersionId} not found in workspace ${workspaceId}`,
      );
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
      this.captureDroppedDispatch(
        `Core workflow version ${coreWorkflowVersionId} does not belong to workflow ${workflowId} in workspace ${workspaceId}`,
      );
      return;
    }

    if (coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE) {
      this.captureDroppedDispatch(
        `Core workflow version ${coreWorkflowVersionId} is not active in workspace ${workspaceId}`,
      );
      return;
    }

    if (
      isDefined(workspaceWorkflowVersionId) &&
      (coreWorkflowVersion.workspaceWorkflowVersionId ??
        (await this.workflowVersionCoreSyncService.findWorkspaceVersionIdByCoreVersionId(
          workspaceId,
          coreWorkflowVersionId,
        ))) !== workspaceWorkflowVersionId
    ) {
      this.captureDroppedDispatch(
        `Workspace version ${workspaceWorkflowVersionId} conflicts with core version ${coreWorkflowVersionId} in workspace ${workspaceId}`,
      );
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
      this.captureDroppedDispatch(
        `Legacy workflow trigger for ${data.workflowId} has no core version mapping in workspace ${data.workspaceId}`,
      );
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

  private captureDroppedDispatch(message: string): void {
    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([new Error(message)]);
  }
}
