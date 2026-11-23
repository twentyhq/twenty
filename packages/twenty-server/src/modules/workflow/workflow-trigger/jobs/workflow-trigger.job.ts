import { Logger, Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { CoreWorkflowTriggerService } from 'src/engine/core-modules/workflow/services/core-workflow-trigger.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';

export type WorkflowTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  coreWorkflowVersionId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowTriggerJob {
  private readonly logger = new Logger(WorkflowTriggerJob.name);
  constructor(
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly coreWorkflowTriggerService: CoreWorkflowTriggerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(WorkflowTriggerJob.name)
  async handle({
    workflowId,
    workspaceId,
    coreWorkflowVersionId,
    payload,
  }: WorkflowTriggerJobData): Promise<void> {
    const coreWorkflowVersion =
      await this.coreWorkflowTriggerService.findCoreVersionById(
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
      return;
    }

    await this.coreWorkflowRunnerService.run({
      workspaceId,
      coreWorkflowVersionId,
      payload,
      source: buildWorkflowRunSource(coreWorkflow.name),
    });
  }

  private captureDroppedDispatch(message: string): void {
    this.logger.error(message);
    this.exceptionHandlerService.captureExceptions([new Error(message)]);
  }
}
