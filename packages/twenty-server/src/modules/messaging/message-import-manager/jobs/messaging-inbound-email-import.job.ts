import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';
import {
  INBOUND_EMAIL_MESSAGE_SOURCE,
  type InboundEmailMessageReference,
  type InboundEmailMessageSource,
} from 'src/modules/messaging/message-import-manager/drivers/inbound-email/types/inbound-email-message-source.type';

export type MessagingInboundEmailImportJobData = {
  envelopeRecipients: string[];
} & (
  | { source: InboundEmailMessageSource; reference: string }
  // legacy payload shape from jobs enqueued before the source abstraction
  | { s3Key: string }
);

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
    const messageReference: InboundEmailMessageReference =
      's3Key' in data
        ? {
            source: INBOUND_EMAIL_MESSAGE_SOURCE.SES_S3,
            reference: data.s3Key,
          }
        : { source: data.source, reference: data.reference };

    const outcome = await this.inboundEmailImportService.importInboundMessage({
      messageReference,
      envelopeRecipients: data.envelopeRecipients,
    });

    this.logger.log(
      `Inbound email import outcome for ${messageReference.reference}: ${outcome.kind}`,
    );
  }
}
