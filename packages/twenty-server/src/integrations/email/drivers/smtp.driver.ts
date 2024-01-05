import { createTransport, Transporter, SendMailOptions } from 'nodemailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import { EmailDriver } from 'src/integrations/email/drivers/interfaces/email-driver.interface';

export class SmtpDriver implements EmailDriver {
  private transport: Transporter;

  constructor(options: SMTPConnection.Options) {
    this.transport = createTransport(options);
  }

  async send(sendMailOptions: SendMailOptions): Promise<void> {
    await this.transport.sendMail(sendMailOptions);
  }
}
