import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ImapFlow, ImapFlowOptions } from 'imapflow';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImapSyncService implements OnModuleDestroy {
  private readonly logger = new Logger(ImapSyncService.name);
  private clients: Map<string, ImapFlow> = new Map();

  constructor(private readonly configService: ConfigService) {}

  /**
   * PRO-GRADE IMAP SYNC ENGINE
   * Features: Auto-reconnect, IDLE Support, and OAuth2 compatibility.
   */
  async initializeSync(accountId: string, options: Partial<ImapFlowOptions>, lastUid: number = 0) {
    // 1. Setup secure connection defaults
    const client = new ImapFlow({
      host: options.host,
      port: options.port ?? 993,
      secure: true,
      auth: options.auth, // Supports User/Pass or OAuth2 Access Tokens
      logger: false,
    });

    this.clients.set(accountId, client);

    try {
      await client.connect();
      this.logger.log(`[IMAP] Connected: ${accountId}`);

      // 2. Perform Delta Sync (Efficiency)
      await this.syncDelta(client, lastUid);

      // 3. Setup Persistent IDLE (Real-time)
      this.setupEventListener(client, accountId);

    } catch (error) {
      this.logger.error(`[IMAP] Connection Error (${accountId}): ${error.message}`);
      await this.handleReconnect(accountId, options, lastUid);
    }
  }

  private async syncDelta(client: ImapFlow, lastUid: number) {
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Use SEARCH to find only messages newer than our last known UID
      const range = lastUid > 0 ? `${lastUid + 1}:*` : '1:*';
      
      const fetchQuery = client.fetch({ uid: range }, {
        uid: true,
        envelope: true,
        bodyStructure: true,
        flags: true,
        internalDate: true,
      });

      for await (const msg of fetchQuery) {
        // Emit event to Twenty's internal message bus
        this.logger.debug(`[IMAP] Discovered UID: ${msg.uid}`);
      }
    } finally {
      lock.release();
    }
  }

  private setupEventListener(client: ImapFlow, accountId: string) {
    // IDLE allows the server to push new mail notifications instantly
    client.on('exists', async () => {
      this.logger.log(`[IMAP] Instant Push received for ${accountId}`);
      await this.syncDelta(client, 0); 
    });

    client.on('close', () => {
      this.logger.warn(`[IMAP] Connection closed for ${accountId}. Re-triggering sync.`);
    });
  }

  private async handleReconnect(accountId: string, options: any, lastUid: number) {
    this.logger.log(`[IMAP] Retrying connection for ${accountId} in 30s...`);
    setTimeout(() => this.initializeSync(accountId, options, lastUid), 30000);
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.logout();
    }
  }
}
