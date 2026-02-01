import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ImapIdleService implements OnModuleDestroy {
    private readonly logger = new Logger(ImapIdleService.name);
    private activeClients: Map<string, ImapFlow> = new Map();
    private activeLocks: Map<string, any> = new Map();

    constructor(private readonly eventEmitter: EventEmitter2) { }

    /**
     * Start listening for IDLE events on a specific folder
     */
    async startIdle(client: ImapFlow, accountId: string, folderPath: string = 'INBOX'): Promise<void> {
        if (this.activeClients.has(accountId)) {
            this.logger.warn(`IDLE already active for account ${accountId}`);
            return;
        }

        try {
            // "Enterprise" Safety: Acquire a lock on the mailbox to prevent other commands 
            // from changing the selected mailbox on this connection while IDLE is active.
            const lock = await client.getMailboxLock(folderPath);
            this.activeLocks.set(accountId, lock);

            // Hook into the 'exists' event (New Email)
            client.on('exists', (data) => {
                this.logger.log(`New email detected for ${accountId}: ${data.count} messages total`);
                this.eventEmitter.emit('imap.new-email', { accountId, folderPath, count: data.count });
            });

            // Hook into 'expunge' (Deleted Email)
            client.on('expunge', (seq) => {
                this.logger.debug(`Email deleted in ${accountId} (seq: ${seq})`);
            });

            this.activeClients.set(accountId, client);
            this.logger.log(`IDLE started for account ${accountId} on ${folderPath}`);

            // Start IDLE in background (non-blocking)
            client.idle().then(() => {
                this.logger.log(`IDLE finished for ${accountId}`);
                this.cleanupAccount(accountId);
            }).catch(err => {
                this.logger.error(`IDLE crashed for ${accountId}: ${err.message}`);
                this.cleanupAccount(accountId);
            });

        } catch (error) {
            this.logger.error(`Failed to start IDLE for ${accountId}: ${error.message}`);
            // Ensure we release lock if startup fails
            const lock = this.activeLocks.get(accountId);
            if (lock) {
                lock.release();
                this.activeLocks.delete(accountId);
            }
            throw error;
        }
    }

    /**
     * Stop IDLE and cleanup
     */
    async stopIdle(accountId: string): Promise<void> {
        const client = this.activeClients.get(accountId);
        if (!client) return;

        try {
            await client.logout(); // Terminate connection
        } catch (err) {
            this.logger.warn(`Error stopping IDLE for ${accountId}: ${err.message}`);
        } finally {
            this.cleanupAccount(accountId);
            this.logger.log(`IDLE stopped for account ${accountId}`);
        }
    }

    private cleanupAccount(accountId: string) {
        // Release Lock
        const lock = this.activeLocks.get(accountId);
        if (lock) {
            try {
                lock.release();
            } catch (err) { /* ignore */ }
            this.activeLocks.delete(accountId);
        }
        // Remove Client
        this.activeClients.delete(accountId);
    }

    async onModuleDestroy() {
        // Cleanup all connections on server shutdown
        this.logger.log(`Cleaning up ${this.activeClients.size} IDLE connections...`);
        for (const [id, client] of this.activeClients) {
            try {
                this.logger.log(`Stopping IDLE for ${id} due to shutdown`);
                await client.logout();
            } catch (err) {
                this.logger.warn(`Failed to logout ${id}: ${err.message}`);
            }
            this.cleanupAccount(id);
        }
        this.activeClients.clear();
        this.activeLocks.clear();
    }
}
