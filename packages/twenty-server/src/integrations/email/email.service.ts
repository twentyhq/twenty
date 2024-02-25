import { Inject, Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';

@Injectable()
export class EmailService {
  constructor(
    @Inject(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.messageQueueService.add<SendMailOptions>(
      EmailSenderJob.name,
      sendMailOptions,
      { retryLimit: 3 },
    );
  }
}
