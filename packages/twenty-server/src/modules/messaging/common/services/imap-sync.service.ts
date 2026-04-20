import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
// @ts-ignore - Ignore potential missing types in CI environment
import { ImapFlow } from 'imapflow';

@Injectable()
export class ImapSyncService implements OnModuleDestroy {
  private readonly logger = new Logger(ImapSyncService.name);
  private clients: Map<string, any> = new Map();
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
      const newestUid = await this.performDeltaSync(client, accountId);
      this.lastKnownUids.set(accountId, newestUid);
      this.setupEventListener(client, accountId);
    } catch (error: any) {
      this.logger.error(`Connection failed for ${accountId}: ${error.message}`);
    }
  }

  private async performDeltaSync(client: any, accountId: string): Promise<number> {
    const lock = await client.getMailboxLock('INBOX');
    let maxUidFound = this.lastKnownUids.get(accountId) || 0;

    try {
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

  private setupEventListener(client: any, accountId: string) {
    client.on('exists', async () => {
      try {
        const newMaxUid = await this.performDeltaSync(client, accountId);
        this.lastKnownUids.set(accountId, newMaxUid);
      } catch (e) {
        this.logger.error('Sync failed during exists event');
      }
    });
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      try {
        await client.logout();
      } catch (e) {
        // Silently fail on logout
      }
    }
  }
}
