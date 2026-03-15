import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

type CachedConnection = {
  client: ImapFlow;
  parametersHash: string;
};

@Injectable()
export class ImapClientProvider implements OnModuleDestroy {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;
  private static readonly MAX_CACHE_SIZE = 100;

  private readonly connectionCache = new Map<string, CachedConnection>();

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getClient(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    const parametersHash = JSON.stringify(
      connectedAccount.connectionParameters,
    );
    const cached = this.connectionCache.get(connectedAccount.id);

    if (
      cached &&
      cached.client.authenticated &&
      cached.parametersHash === parametersHash
    ) {
      try {
        // Health check: NOOP ensures the connection is still alive and responsive
        // We use a short timeout for the health check to avoid hanging
        await Promise.race([
          cached.client.noop(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), 5000),
          ),
        ]);

        this.logger.debug(
          `Reusing cached IMAP connection for ${connectedAccount.handle}`,
        );

        return cached.client;
      } catch (error) {
        this.logger.warn(
          `Cached IMAP connection for ${connectedAccount.handle} is dead or stale, evicting from cache: ${error.message}`,
        );

        this.connectionCache.delete(connectedAccount.id);

        try {
          await cached.client.logout();
        } catch {
          // Ignore logout errors for a dead connection
        }
      }
    }

    // If parameters changed, close the old connection even if it was authenticated
    if (cached && cached.parametersHash !== parametersHash) {
      this.logger.log(
        `IMAP parameters changed for ${connectedAccount.handle}, closing old connection`,
      );
      this.connectionCache.delete(connectedAccount.id);
      try {
        await cached.client.logout();
      } catch {
        // Ignore
      }
    }

    try {
      const client = await this.createConnection(connectedAccount);

      // Implement simple LRU-like eviction if cache is full
      if (this.connectionCache.size >= ImapClientProvider.MAX_CACHE_SIZE) {
        const oldestId = this.connectionCache.keys().next().value;
        const oldestConnection = this.connectionCache.get(oldestId);
        if (oldestConnection) {
          this.logger.log(`Cache full, evicting oldest connection: ${oldestId}`);
          this.connectionCache.delete(oldestId);
          oldestConnection.client.logout().catch(() => {});
        }
      }

      this.connectionCache.set(connectedAccount.id, {
        client,
        parametersHash,
      });

      return client;
    } catch (error) {
      this.logger.error(
        `Failed to establish IMAP connection for ${connectedAccount.handle}: ${error.message}`,
        error.stack,
      );

      throw parseImapAuthenticationError(error);
    }
  }

  async closeClient(_client: ImapFlow): Promise<void> {
    // We keep the client open in the cache for reuse.
    // Logout will happen when the process terminates, connection is lost, or parameters change.
    this.logger.debug('Keeping IMAP client open in cache');
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

    if (!isDefined(connectedAccount.handle)) {
      throw new CustomError(
        'Handle is required',
        MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
      );
    }

    const validatedImapHost =
      await this.secureHttpClientService.getValidatedHost(
        connectionParameters.IMAP?.host || '',
      );

    const client = new ImapFlow({
      host: validatedImapHost,
      port: connectionParameters.IMAP?.port || 993,
      secure: connectionParameters.IMAP?.secure,
      auth: {
        user: isDefined(connectionParameters.IMAP?.username)
          ? connectionParameters.IMAP?.username
          : connectedAccount.handle,
        pass: connectionParameters.IMAP?.password || '',
      },
      logger: false,
      tls: {
        rejectUnauthorized: false,
        servername: connectionParameters.IMAP?.host,
      },
      connectionTimeout: ImapClientProvider.CONNECTION_TIMEOUT_MS,
      greetingTimeout: ImapClientProvider.GREETING_TIMEOUT_MS,
    });

    try {
      await client.connect();

      this.logger.log(
        `Connected to IMAP server for ${connectedAccount.handle}`,
      );

      return client;
    } catch (error) {
      try {
        await client.logout();
      } catch {
        // Ignore cleanup errors
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing all cached IMAP connections...');
    for (const [id, cached] of this.connectionCache) {
      try {
        await cached.client.logout();
        this.logger.debug(`Closed IMAP connection for ${id}`);
      } catch (error) {
        this.logger.error(
          `Error closing IMAP connection ${id}: ${error.message}`,
        );
      }
    }
    this.connectionCache.clear();
  }
}
