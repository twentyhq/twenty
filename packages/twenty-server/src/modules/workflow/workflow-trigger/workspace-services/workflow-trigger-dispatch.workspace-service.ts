import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import {
  WorkflowTriggerJob,
  type WorkflowTriggerJobData,
} from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';
import { buildWorkflowTriggerRefusalError } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-trigger-refusal-error.util';

@Injectable()
export class WorkflowTriggerDispatchWorkspaceService {
  private readonly logger = new Logger(
    WorkflowTriggerDispatchWorkspaceService.name,
  );

  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly coreWorkflowRunnerService: CoreWorkflowRunnerService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async enqueueTriggerOrFailRun({
    jobData,
    jobOptions,
  }: {
    jobData: WorkflowTriggerJobData;
    jobOptions: QueueJobOptions;
  }): Promise<void> {
    try {
      await this.messageQueueService.add<WorkflowTriggerJobData>(
        WorkflowTriggerJob.name,
        jobData,
        jobOptions,
      );
    } catch (error) {
      if (!(error instanceof MessageQueueException)) {
        throw error;
      }

      await this.recordRefusedDispatch({ jobData, exception: error });
    }
  }

  private async recordRefusedDispatch({
    jobData,
    exception,
  }: {
    jobData: WorkflowTriggerJobData;
    exception: MessageQueueException;
  }): Promise<void> {
    const { workspaceId, workflowId } = jobData;

    try {
      const coreWorkflow =
        await this.workflowCoreSyncService.findCoreWorkflowByIdOrWorkspaceWorkflowId(
          workspaceId,
          workflowId,
        );
      const coreWorkflowVersionId =
        await this.workflowVersionCoreSyncService.resolveDispatchedCoreVersionId(
          {
            workspaceId,
            coreWorkflowVersionId: jobData.coreWorkflowVersionId,
            workspaceWorkflowVersionId: jobData.workspaceWorkflowVersionId,
            lastPublishedCoreWorkflowVersionId:
              coreWorkflow?.lastPublishedCoreWorkflowVersionId,
          },
        );

      if (!isDefined(coreWorkflow) || !isDefined(coreWorkflowVersionId)) {
        throw new WorkflowTriggerException(
          `No core workflow version found for workflow ${workflowId}`,
          WorkflowTriggerExceptionCode.NOT_FOUND,
        );
      }

      await this.coreWorkflowRunnerService.createFailedRun({
        workspaceId,
        coreWorkflowVersionId,
        payload: jobData.payload,
        source: buildWorkflowRunSource(coreWorkflow.name),
        error: buildWorkflowTriggerRefusalError(exception),
      });
    } catch (recordError) {
      const message = `Failed to record the refused trigger dispatch of workflow ${workflowId} in workspace ${workspaceId} (${exception.code}): ${
        recordError instanceof Error ? recordError.message : String(recordError)
      }`;

      this.logger.error(message);
      this.exceptionHandlerService.captureExceptions([new Error(message)], {
        workspace: { id: workspaceId },
      });
    }
  }
}
