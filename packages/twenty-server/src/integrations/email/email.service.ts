import { Inject, Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { EmailSenderJob } from 'src/integrations/email/email-sender.job';
import { MessageQueue } from 'src/integrations/message-queue/constants/MessageQueueDriver';

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
