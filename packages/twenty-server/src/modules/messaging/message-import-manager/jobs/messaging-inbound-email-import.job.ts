import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';

export type MessagingInboundEmailImportJobData = {
  s3Key: string;
  envelopeRecipients: string[];
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessagingInboundEmailImportJob {
  private readonly logger = new Logger(MessagingInboundEmailImportJob.name);

  constructor(
    private readonly inboundEmailImportService: InboundEmailImportService,
  ) {}

  @Process(MessagingInboundEmailImportJob.name)
  async handle(data: MessagingInboundEmailImportJobData): Promise<void> {
    const { s3Key, envelopeRecipients } = data;

    const outcome = await this.inboundEmailImportService.importInboundMessage({
      s3Key,
      envelopeRecipients,
    });

    this.logger.log(
      `Inbound email import outcome for ${s3Key}: ${outcome.kind}`,
    );
  }
}
