import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';

export type ChargeEmmitBillJob = {
  workspaceId: string;
  chargeId: string;
};

@Processor({
  queueName: MessageQueue.chargeQueue,
  scope: Scope.REQUEST,
})
export class ChageEmmitBillJob {
  private readonly logger = new Logger(ChageEmmitBillJob.name);

  constructor(private readonly chargeService: InterApiService) {}

  @Process(ChageEmmitBillJob.name)
  async handle(data: ChargeEmmitBillJob): Promise<void> {
    const { chargeId, workspaceId } = data;

    this.logger.warn(`Emmitting bill for charge ${chargeId}`);
  }
}
