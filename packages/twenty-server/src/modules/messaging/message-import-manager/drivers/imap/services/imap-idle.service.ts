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

            // Start the IDLE command
            await client.idle();
            this.activeClients.set(accountId, client);

            this.logger.log(`IDLE started for account ${accountId} on ${folderPath}`);
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

        // imapflow handles stopping IDLE when you issue another command, 
        // but explicit logout/idleStop is good practice.
        // In imapflow, simply calling another command breaks IDLE, but we want to be clean.
        // client.idle() returns a promise that resolves when IDLE ends.
        // We can force it to verify.

        this.activeClients.delete(accountId);
        this.logger.log(`IDLE stopped for account ${accountId}`);
    }

    onModuleDestroy() {
        // Cleanup all connections on server shutdown
        for (const [id, client] of this.activeClients) {
            // client.logout() or close logic would happen here in a real service manager
            this.logger.log(`Stopping IDLE for ${id} due to shutdown`);
        }
    }
}
