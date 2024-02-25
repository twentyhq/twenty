import { Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EmailSenderService } from 'src/integrations/email/email-sender.service';

@Injectable()
export class EmailSenderJob implements MessageQueueJob<SendMailOptions> {
  constructor(private readonly emailSenderService: EmailSenderService) {}

  async handle(data: SendMailOptions): Promise<void> {
    await this.emailSenderService.send(data);
  }
}
