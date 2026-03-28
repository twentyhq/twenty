import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { ImapSyncService } from './imap-sync.service';
import { MessageImportManagerService } from '../../services/messaging-import-manager.service';
import logger from '@/logging';

@Injectable()
export class ImapIdleSyncService implements OnModuleDestroy {
  private readonly logger = new Logger(ImapIdleSyncService.name);
  private readonly idleClients = new Map<string, ImapFlow>();

  constructor(
    private readonly imapSyncService: ImapSyncService,
    private readonly messageImportManager: MessageImportManagerService,
  ) {}

  async startIdle(client: ImapFlow, accountId: string, folderPath: string) {
    if (this.idleClients.has(accountId)) {
      this.logger.warn(`IDLE already active for account ${accountId}`);
      return;
    }

    this.logger.log(`Starting IMAP IDLE for account ${accountId} on folder ${folderPath}`);
    
    client.on('exists', async (data) => {
      this.logger.log(`New message detected via IDLE for account ${accountId}: ${data.count} messages`);
      // Trigger a sync when new messages are detected
      await this.messageImportManager.triggerSync(accountId);
    });

    try {
      await client.idle();
      this.idleClients.set(accountId, client);
    } catch (error) {
      this.logger.error(`Failed to start IDLE for account ${accountId}: ${error.message}`);
    }
  }

  async stopIdle(accountId: string) {
    const client = this.idleClients.get(accountId);
    if (client) {
      await client.logout();
      this.idleClients.delete(accountId);
      this.logger.log(`Stopped IDLE for account ${accountId}`);
    }
  }

  onModuleDestroy() {
    for (const accountId of this.idleClients.keys()) {
      this.stopIdle(accountId);
    }
  }
}
