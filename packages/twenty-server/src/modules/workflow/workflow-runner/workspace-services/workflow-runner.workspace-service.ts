import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import {
  RunWorkflowJob,
  RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-run.workspace-service';

@Injectable()
export class WorkflowRunnerWorkspaceService {
  constructor(
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async run(
    workspaceId: string,
    workflowVersionId: string,
    payload: object,
    source: ActorMetadata,
  ) {
    const workflowRunId =
      await this.workflowRunWorkspaceService.createWorkflowRun(
        workflowVersionId,
        source,
      );

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
