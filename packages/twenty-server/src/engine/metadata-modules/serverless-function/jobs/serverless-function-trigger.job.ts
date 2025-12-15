import { Scope } from '@nestjs/common';

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
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  @Process(ServerlessFunctionTriggerJob.name)
  async handle(serverlessFunctionPayloads: ServerlessFunctionTriggerJobData[]) {
    await Promise.all(
      serverlessFunctionPayloads.map(
        async (serverlessFunctionPayload) =>
          await this.serverlessFunctionService.executeOneServerlessFunction({
            id: serverlessFunctionPayload.serverlessFunctionId,
            workspaceId: serverlessFunctionPayload.workspaceId,
            payload: serverlessFunctionPayload.payload || {},
            version: 'draft',
          }),
      ),
    );
  }
}
