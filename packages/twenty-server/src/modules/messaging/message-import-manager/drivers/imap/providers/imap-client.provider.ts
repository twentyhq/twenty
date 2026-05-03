import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;
  private static readonly RESPONSE_TIMEOUT_MS = 30000;
  private static readonly MAX_RETRIES = 2;

  private readonly clients = new Map<string, ImapFlow>();

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getClient(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    const cachedClient = this.clients.get(connectedAccount.id);

    if (cachedClient && cachedClient.usable) {
      this.logger.debug(
        `Reusing cached IMAP client for ${connectedAccount.handle}`,
      );
      return cachedClient;
    }

    try {
      const client = await this.createConnectionWithRetry(connectedAccount);
      this.clients.set(connectedAccount.id, client);
      return client;
    } catch (error) {
      this.logger.error(
        `Failed to establish IMAP connection for ${connectedAccount.handle}: ${error.message}`,
        error.stack,
      );

      throw parseImapAuthenticationError(error);
    }
  }

  async closeClient(connectedAccountId: string): Promise<void> {
    const client = this.clients.get(connectedAccountId);

    if (!client) {
      return;
    }

    try {
      await client.logout();
      this.clients.delete(connectedAccountId);
      this.logger.log(`Closed IMAP client for ${connectedAccountId}`);
    } catch (error) {
      this.logger.error(`Error closing IMAP client: ${error.message}`);
      this.clients.delete(connectedAccountId);
    }
  }

  // Helper for cleanup when we want to force logout a specific client instance
  async forceLogout(client: ImapFlow): Promise<void> {
    try {
      await client.logout();
    } catch {
      // Ignore
    }
  }

  private async createConnectionWithRetry(
    connectedAccount: ConnectedAccountIdentifier,
    retryCount = 0,
  ): Promise<ImapFlow> {
    try {
      return await this.createConnection(connectedAccount);
    } catch (error) {
      if (retryCount < ImapClientProvider.MAX_RETRIES) {
        this.logger.warn(
          `Connection attempt ${retryCount + 1} failed for ${connectedAccount.handle}, retrying...`,
        );
        return this.createConnectionWithRetry(connectedAccount, retryCount + 1);
      }
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
        rejectUnauthorized: false, // Potentially unsafe, but often required for IMAP
      },
      connectionTimeout: ImapClientProvider.CONNECTION_TIMEOUT_MS,
      greetingTimeout: ImapClientProvider.GREETING_TIMEOUT_MS,
      responseTimeout: ImapClientProvider.RESPONSE_TIMEOUT_MS,
      // Default imapflow options usually enable CONDSTORE/QRESYNC if available
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
}
