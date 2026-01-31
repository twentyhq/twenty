import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ImapIdleService implements OnModuleDestroy {
    private readonly logger = new Logger(ImapIdleService.name);
    private activeClients: Map<string, ImapFlow> = new Map();

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
            // Ensure we are in the correct mailbox
            await client.mailboxOpen(folderPath);

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
            // client.idle() resolves only when IDLE finishes, so we don't await it here.
            client.idle().then(() => {
                this.logger.log(`IDLE finished for ${accountId}`);
                this.activeClients.delete(accountId);
            }).catch(err => {
                this.logger.error(`IDLE crashed for ${accountId}: ${err.message}`);
                this.activeClients.delete(accountId);
            });

        } catch (error) {
            this.logger.error(`Failed to start IDLE for ${accountId}: ${error.message}`);
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
            await client.logout(); // This terminates IDLE and closes the connection
        } catch (err) {
            this.logger.warn(`Error stopping IDLE for ${accountId}: ${err.message}`);
        } finally {
            this.activeClients.delete(accountId);
            this.logger.log(`IDLE stopped for account ${accountId}`);
        }
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
        }
        this.activeClients.clear();
    }
}
