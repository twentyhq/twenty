import { createTransport } from 'nodemailer';

export const deliverMailOverSmtp = async ({
  host,
  port,
  from,
  to,
  subject,
}: {
  host: string;
  port: number;
  from: string;
  to: string;
  subject: string;
}): Promise<void> => {
  const transport = createTransport({ host, port, secure: false });

  await transport.sendMail({ from, to, subject, text: `body of ${subject}` });

  transport.close();
};
