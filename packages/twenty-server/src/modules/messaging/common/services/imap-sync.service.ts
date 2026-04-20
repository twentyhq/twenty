import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ImapFlow, ImapFlowOptions } from 'imapflow';

@Injectable()
export class ImapSyncService implements OnModuleDestroy {
  private readonly logger = new Logger(ImapSyncService.name);
  private clients: Map<string, ImapFlow> = new Map();
  private lastKnownUids: Map<string, number> = new Map();

  async initializeSync(accountId: string, options: any, initialUid: number = 0) {
    const client = new ImapFlow({
      host: options.host,
      port: options.port ?? 993,
      secure: true,
      auth: options.auth,
      logger: false,
    });

    this.clients.set(accountId, client);
    this.lastKnownUids.set(accountId, initialUid);

    try {
      await client.connect();
      // Perform initial sync and update the tracker
      const newestUid = await this.performDeltaSync(client, accountId);
      this.lastKnownUids.set(accountId, newestUid);
      
      this.setupEventListener(client, accountId);
    } catch (error) {
      this.logger.error(`Connection failed for ${accountId}: ${error.message}`);
    }
  }

  private async performDeltaSync(client: ImapFlow, accountId: string): Promise<number> {
    const lock = await client.getMailboxLock('INBOX');
    let maxUidFound = this.lastKnownUids.get(accountId) || 0;

    try {
      // FIX: Use the tracked UID instead of hardcoded 0 to prevent full re-fetch
      const range = maxUidFound > 0 ? `${maxUidFound + 1}:*` : '1:*';
      const fetchQuery = client.fetch({ uid: range }, { uid: true, envelope: true });

      for await (const msg of fetchQuery) {
        if (msg.uid > maxUidFound) maxUidFound = msg.uid;
      }
      return maxUidFound;
    } finally {
      lock.release();
    }
  }

  private setupEventListener(client: ImapFlow, accountId: string) {
    client.on('exists', async () => {
      // FIX: Call re-sync using the last stored UID
      const newMaxUid = await this.performDeltaSync(client, accountId);
      this.lastKnownUids.set(accountId, newMaxUid);
    });
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.logout();
    }
  }
}
