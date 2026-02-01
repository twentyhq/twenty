
import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow } from 'imapflow';

@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);

  async connectAndFetch(config: { host: string; port: number; auth: any }) {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: true,
      auth: config.auth,
      logger: false,
    });

    await client.connect();
    this.logger.log('IMAP Connected');

    let lock = await client.getMailboxLock('INBOX');
    try {
        const messages = [];
        for await (let message of client.fetch('1:*', { envelope: true })) {
            messages.push(message.envelope);
        }
        return messages;
    } finally {
        lock.release();
        await client.logout();
    }
  }
}
