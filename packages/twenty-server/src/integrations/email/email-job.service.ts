import { Inject, Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { EmailJob } from 'src/integrations/email/email.job';

@Injectable()
export class EmailJobService {
  constructor(
    @Inject(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.messageQueueService.add<SendMailOptions>(
      EmailJob.name,
      sendMailOptions,
      { retryLimit: 3 },
    );
  }
}
