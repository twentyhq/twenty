import { Injectable, Logger } from '@nestjs/common';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {
  RunWorkflowJob,
  RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowRunnerWorkspaceService {
  private readonly logger = new Logger(WorkflowRunnerWorkspaceService.name);
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async run(
    workspaceId: string,
    workflowVersionId: string,
    payload: object,
    source: ActorMetadata,
  ) {
    const canFeatureBeUsed =
      await this.billingUsageService.canFeatureBeUsed(workspaceId);

    if (!canFeatureBeUsed) {
      this.logger.log(
        'Cannot execute billed function, there is no subscription for this workspace',
      );
    }
    const workflowRunId =
      await this.workflowRunWorkspaceService.createWorkflowRun({
        workflowVersionId,
        createdBy: source,
      });

    await this.messageQueueService.add<RunWorkflowJobData>(
      RunWorkflowJob.name,
      {
        workspaceId,
        workflowVersionId,
        payload: payload,
        workflowRunId,
      },
    );

    return { workflowRunId };
  }
}
