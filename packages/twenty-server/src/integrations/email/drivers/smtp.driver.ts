import { Logger } from '@nestjs/common';

import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import { EmailDriver } from 'src/integrations/email/drivers/interfaces/email-driver.interface';

export class SmtpDriver implements EmailDriver {
  private readonly logger = new Logger(SmtpDriver.name);
  private transport: Transporter;

  constructor(options: SMTPConnection.Options) {
    this.transport = createTransport(options);
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    this.transport
      .sendMail(sendMailOptions)
      .then(() =>
        this.logger.log(`Email to '${sendMailOptions.to}' successfully sent`),
      )
      .catch((err) =>
        this.logger.error(`sending email to '${sendMailOptions.to}': ${err}`),
      );
  }
}
