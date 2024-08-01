import { Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  RunWorkflowJobData,
  WorkflowRunnerJob,
} from 'src/modules/workflow/workflow-runner/workflow-runner.job';

export type WorkflowEventTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
};

@Processor(MessageQueue.workflowQueue)
export class WorkflowEventTriggerJob {
  private readonly logger = new Logger(WorkflowEventTriggerJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(WorkflowEventTriggerJob.name)
  async handle(data: WorkflowEventTriggerJobData): Promise<void> {
    this.messageQueueService.add<RunWorkflowJobData>(WorkflowRunnerJob.name, {
      workspaceId: data.workspaceId,
      workflowId: data.workflowId,
      payload: data.payload,
    });
  }
}
