import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { ImapClientProvider } from 'src/modules/messaging/message-import-manager/drivers/imap/providers/imap-client.provider';

@Injectable()
export class ImapIdleService implements OnModuleDestroy {
  private readonly logger = new Logger(ImapIdleService.name);
  private activeClients = new Map<string, ImapFlow>();
  private activeLocks = new Map<string, any>(); // Map to store mailbox locks

  constructor(
    private readonly imapClientProvider: ImapClientProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startIdle(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    folderPath = 'INBOX',
  ): Promise<void> {
    const accountId = connectedAccount.id;

    if (this.activeClients.has(accountId)) {
      this.logger.debug(`IDLE already active for account ${accountId}`);
      return;
    }

    const client = await this.imapClientProvider.getClient(connectedAccount);
    
    try {
      this.activeClients.set(accountId, client);

      // Acquire lock for the folder before idling
      const lock = await client.getMailboxLock(folderPath);
      this.activeLocks.set(accountId, lock);

      this.logger.log(`Starting IMAP IDLE for ${connectedAccount.handle} on ${folderPath}`);

      // Listen for new messages
      client.on('exists', (data) => {
        this.logger.debug(`New message detected in ${folderPath} for ${connectedAccount.handle}: ${data.count}`);
        this.eventEmitter.emit('imap.new-email', {
          connectedAccountId: accountId,
          workspaceId,
          folderPath,
        });
      });

      // Handle IDLE in background
      client.idle().then(() => {
        this.logger.debug(`IDLE stopped for ${connectedAccount.handle}`);
      }).catch((error) => {
        this.logger.error(`IDLE error for ${connectedAccount.handle}: ${error.message}`);
        this.stopIdle(accountId);
      });

    } catch (error) {
      this.logger.error(`Failed to start IDLE for ${connectedAccount.handle}: ${error.message}`);
      await this.imapClientProvider.closeClient(client);
      this.activeClients.delete(accountId);
    }
  }

  async stopIdle(accountId: string): Promise<void> {
    const client = this.activeClients.get(accountId);
    const lock = this.activeLocks.get(accountId);

    if (isDefined(lock)) {
      lock.release();
      this.activeLocks.delete(accountId);
    }

    if (isDefined(client)) {
      await this.imapClientProvider.closeClient(client);
      this.activeClients.delete(accountId);
      this.logger.log(`Stopped IMAP IDLE for account ${accountId}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down ImapIdleService, stopping all IDLE connections...');
    for (const accountId of this.activeClients.keys()) {
      await this.stopIdle(accountId);
    }
  }
}
