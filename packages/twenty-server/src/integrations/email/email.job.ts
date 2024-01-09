import { Injectable } from '@nestjs/common';

import { SendMailOptions } from 'nodemailer';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EmailService } from 'src/integrations/email/email.service';

@Injectable()
export class EmailJob implements MessageQueueJob<SendMailOptions> {
  constructor(private readonly emailService: EmailService) {}

  async handle(data: SendMailOptions): Promise<void> {
    console.log('sending email', data);
    await this.emailService.send(data);
    console.log('done');
  }
}
