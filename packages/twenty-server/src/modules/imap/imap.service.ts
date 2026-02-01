
import { Injectable, Logger } from '@nestjs/common';
import { ImapFlow } from 'imapflow';

@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);

  async connectAndFetch(config: { host: string; port: number; auth: any }): Promise<any[]> {
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

        let lock = await client.getMailboxLock('INBOX');
        try {
            // FIX: Check for empty mailbox to prevent 'Invalid messageset' error (1:*)
            const total = client.mailbox.exists || 0;
            if (total === 0) return [];

            // FIX: Use UIDs to prevent race conditions (volatility of sequence numbers)
            // 1. Fetch all UIDs (lightweight)
            const uidFetch = client.fetch('1:*', { uid: true, envelope: false, bodyStructure: false });
            const uids: number[] = [];
            
            for await (const msg of uidFetch) {
                uids.push(msg.uid);
            }
            
            if (uids.length === 0) return [];

            // 2. Sort and get last 10
            uids.sort((a, b) => a - b);
            const targets = uids.slice(-10);
            
            // 3. Fetch by UID (stable reference)
            const range = targets.join(',');
            const messages = [];
            
            if (range) {
                // FIX: ImapFlow.fetch(range, query, options)
                // 'uid: true' must be in the 3rd argument (options), unlike 'envelope' (query)
                for await (let message of client.fetch(range, { envelope: true }, { uid: true })) {
                    messages.push(message);
                }
            }
            return messages;
        } finally {
            lock.release();
        }
    } catch (error) {
        this.logger.error('IMAP Operation Failed', error);
        throw error;
    } finally {
        try { await client.logout(); } catch (e) { /* ignore */ }
    }
  }
}
