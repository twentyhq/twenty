import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

export type ServerlessFunctionTriggerJobData = {
  serverlessFunctionId: string;
  workspaceId: string;
  payload?: object;
};

@Processor({
  queueName: MessageQueue.serverlessFunctionQueue,
  scope: Scope.REQUEST,
})
export class ServerlessFunctionTriggerJob {
  private readonly logger = new Logger(ServerlessFunctionTriggerJob.name);

  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  @Process(ServerlessFunctionTriggerJob.name)
  async handle(data: ServerlessFunctionTriggerJobData) {
    const result =
      await this.serverlessFunctionService.executeOneServerlessFunction(
        data.serverlessFunctionId,
        data.workspaceId,
        data.payload || {},
        'draft',
      );

    this.logger.log(result.logs);
  }
}
