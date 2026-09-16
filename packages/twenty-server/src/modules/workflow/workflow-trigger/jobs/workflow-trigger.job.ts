import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
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
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle(data: WorkflowTriggerJobData): Promise<void> {
    const dispatchMode = resolveWorkflowTriggerDispatchMode(data);

    if (dispatchMode.mode === 'INCOMPLETE') {
      this.logger.error(
        `Dispatch ids are half resolved for workflow ${data.workflowId} in workspace ${data.workspaceId}`,
      );
      this.exceptionHandlerService.captureExceptions([
        new Error(
          `Dropped workflow trigger with half resolved dispatch ids for workflow ${data.workflowId} in workspace ${data.workspaceId}`,
        ),
      ]);

      return;
    }

    if (dispatchMode.mode === 'CORE') {
      return this.handleFromCore({
        workspaceId: data.workspaceId,
        coreWorkflowVersionId: dispatchMode.coreWorkflowVersionId,
        workspaceWorkflowVersionId: dispatchMode.workspaceWorkflowVersionId,
        payload: data.payload,
      });
    }

    return this.handleFromWorkspace(data);
  }

  private async handleFromCore({
    workspaceId,
    coreWorkflowVersionId,
    workspaceWorkflowVersionId,
    payload,
  }: {
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

    if (coreWorkflowVersion.status !== CoreWorkflowVersionStatus.ACTIVE) {
      this.captureDroppedDispatch(
        `Core workflow version ${coreWorkflowVersionId} is not active in workspace ${workspaceId}`,
      );
      return;
    }

    if (
      isDefined(workspaceWorkflowVersionId) &&
      coreWorkflowVersion.workspaceWorkflowVersionId !==
        workspaceWorkflowVersionId
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
      source: buildWorkflowRunSource(),
    });
  }

  private async handleFromWorkspace(
    data: WorkflowTriggerJobData,
  ): Promise<void> {
    if (!isDefined(data.workspaceWorkflowVersionId)) {
      this.captureDroppedDispatch(
        `Legacy workflow trigger for ${data.workflowId} in workspace ${data.workspaceId} has no version id`,
      );
      return;
    }

    const coreWorkflowVersion =
      await this.workflowVersionCoreSyncService.findCoreVersionByWorkspaceVersionId(
        data.workspaceId,
        data.workspaceWorkflowVersionId,
      );

    if (!isDefined(coreWorkflowVersion)) {
      this.captureDroppedDispatch(
        `Legacy workflow version ${data.workspaceWorkflowVersionId} has no core mapping in workspace ${data.workspaceId}`,
      );
      return;
    }

    await this.handleFromCore({
      workspaceId: data.workspaceId,
      coreWorkflowVersionId: coreWorkflowVersion.id,
      workspaceWorkflowVersionId: data.workspaceWorkflowVersionId,
      payload: data.payload,
    });
  }

  private captureDroppedDispatch(message: string): void {
    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([new Error(message)]);
  }
}
