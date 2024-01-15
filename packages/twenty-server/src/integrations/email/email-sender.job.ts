import { Injectable, Logger } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EmailSenderService } from 'src/integrations/email/email-sender.service';

@Injectable()
export class EmailSenderJob implements MessageQueueJob<SendMailOptions> {
  private readonly logger = new Logger(EmailSenderJob.name);
  constructor(private readonly emailSenderService: EmailSenderService) {}

  async handle(data: SendMailOptions): Promise<void> {
    await this.emailSenderService.send(data);
    this.logger.log(`Email to ${data.to} sent`);
  }
}
