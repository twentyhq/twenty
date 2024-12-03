import { Scope } from '@nestjs/common';

import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';

export type DeleteServerlessFunctionBatchEvent = {
  ids: string[];
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.serverlessFunctionQueue,
  scope: Scope.REQUEST,
})
export class DeleteServerlessFunctionJob {
  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
  ) {}

  @Process(DeleteServerlessFunctionJob.name)
  async handle(batchEvent: DeleteServerlessFunctionBatchEvent): Promise<void> {
    await Promise.all(
      batchEvent.ids.map((id) =>
        this.serverlessFunctionService.deleteOneServerlessFunction(
          id,
          batchEvent.workspaceId,
        ),
      ),
    );
  }
}
