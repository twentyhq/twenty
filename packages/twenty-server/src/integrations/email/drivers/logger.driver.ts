import { SendMailOptions } from 'nodemailer';

import { EmailDriver } from 'src/integrations/email/drivers/interfaces/email-driver.interface';

export class LoggerDriver implements EmailDriver {
  async send(sendMailOptions: SendMailOptions): Promise<void> {
    const info =
      `Sent email to: ${sendMailOptions.to}\n` +
      `From: ${sendMailOptions.from}\n` +
      `Subject: ${sendMailOptions.subject}\n` +
      `Content Text: ${sendMailOptions.text}\n` +
      `Content HTML: ${sendMailOptions.html}`;

    console.log(info);
  }
}
