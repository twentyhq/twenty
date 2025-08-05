import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly RETRY_ATTEMPTS = 3;
  private static readonly RETRY_DELAY_MS = 1000;
  private static readonly CONNECTION_TIMEOUT_MS = 30000;

  constructor() {}

  async getClient(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    return this.createConnectionWithRetry(connectedAccount);
  }

  async closeClient(client: ImapFlow): Promise<void> {
    try {
      await client.logout();
      this.logger.log('Closed IMAP client');
    } catch (error) {
      this.logger.error(`Error closing IMAP client: ${error.message}`);
    }
  }

  private async createConnectionWithRetry(
    connectedAccount: ConnectedAccountIdentifier,
    attempt = 1,
  ): Promise<ImapFlow> {
    try {
      return await this.createConnection(connectedAccount);
    } catch (error) {
      if (attempt < ImapClientProvider.RETRY_ATTEMPTS) {
        const delay = ImapClientProvider.RETRY_DELAY_MS * attempt;

        this.logger.warn(
          `IMAP connection attempt ${attempt} failed for ${connectedAccount.handle}, retrying in ${delay}ms: ${error.message}`,
        );

        await this.delay(delay);

        return this.createConnectionWithRetry(connectedAccount, attempt + 1);
      }

      this.logger.error(
        `Failed to establish IMAP connection for ${connectedAccount.handle} after ${ImapClientProvider.RETRY_ATTEMPTS} attempts: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  private async createConnection(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    if (
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
      !isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      throw new Error('Connected account is not an IMAP provider');
    }

    const connectionParameters: ImapSmtpCaldavParams =
      (connectedAccount.connectionParameters as unknown as ImapSmtpCaldavParams) ||
      {};

    let client: ImapFlow | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      client = new ImapFlow({
        host: connectionParameters.IMAP?.host || '',
        port: connectionParameters.IMAP?.port || 993,
        secure: connectionParameters.IMAP?.secure,
        auth: {
          user: connectedAccount.handle,
          pass: connectionParameters.IMAP?.password || '',
        },
        logger: false,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const connectionPromise = client.connect();
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('Connection timeout')),
          ImapClientProvider.CONNECTION_TIMEOUT_MS,
        );
      });

      await Promise.race([connectionPromise, timeoutPromise]);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      this.logger.log(
        `Connected to IMAP server for ${connectedAccount.handle}`,
      );

      try {
        const mailboxes = await client.list();

        this.logger.log(
          `Available mailboxes for ${connectedAccount.handle}: ${mailboxes.map((m) => m.path).join(', ')}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to list mailboxes: ${error.message}`);
      }

      return client;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (client) {
        try {
          await client.logout();
        } catch (cleanupError) {
          this.logger.warn(
            `Failed to cleanup client after connection error: ${cleanupError.message}`,
          );
        }
      }

      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
