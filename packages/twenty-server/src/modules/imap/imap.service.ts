
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

    try {
        await client.connect();
        this.logger.log('IMAP Connected');

        // Critical: Ensure lock is released even if fetch fails
        let lock = await client.getMailboxLock('INBOX');
        try {
            // Logic: Fetch latest 10 emails
            const status = await client.mailbox.status('INBOX', { messages: true });
            const total = status.messages || 0;
            if (total === 0) return [];
            
            const fetchStart = Math.max(1, total - 9);
            const messages = [];
            
            // Fetch range start:* (last 10)
            for await (let message of client.fetch(`${fetchStart}:*`, { envelope: true })) {
                messages.push(message.envelope);
            }
            return messages;
        } finally {
            lock.release();
        }
    } catch (error) {
        this.logger.error('IMAP Operation Failed', error);
        throw error; 
    } finally {
        // Bulletproof: Safe logout that doesn't mask errors
        try {
             await client.logout();
        } catch (e) {
             // If logout fails (e.g. connection lost), we suppress it to not mask the original error
             this.logger.warn('Logout failed or connection already closed');
        }
    }
  }
}
