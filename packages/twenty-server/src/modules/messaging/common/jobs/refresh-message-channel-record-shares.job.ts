import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelRecordShareService } from 'src/modules/messaging/common/services/message-channel-record-share.service';

export type RefreshMessageChannelRecordSharesJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class RefreshMessageChannelRecordSharesJob {
  constructor(
    private readonly messageChannelRecordShareService: MessageChannelRecordShareService,
  ) {}

  @Process(RefreshMessageChannelRecordSharesJob.name)
  async handle(data: RefreshMessageChannelRecordSharesJobData): Promise<void> {
    await this.messageChannelRecordShareService.rebuildRecordSharesForMessageChannel(
      data,
    );
  }
}
