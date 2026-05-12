import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);
  private readonly clientsInShutdown = new WeakSet<ImapFlow>();

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async getClient(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    try {
      return await this.createConnection(connectedAccount);
    } catch (error) {
      this.logger.error(
        `Failed to establish IMAP connection for ${connectedAccount.handle}: ${error.message}`,
        error.stack,
      );

      throw parseImapAuthenticationError(error);
    }
  }

  async closeClient(client: ImapFlow): Promise<void> {
    this.clientsInShutdown.add(client);

    try {
      await client.logout();
      this.logger.log('Closed IMAP client');
    } catch (error) {
      if (this.isExpectedSocketError(error)) {
        this.logger.warn(`IMAP client closed with a socket error: ${error.message}`);
      } else {
        this.logger.error(`Error closing IMAP client: ${error.message}`);
      }
    } finally {
      this.clientsInShutdown.delete(client);
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
        rejectUnauthorized: false,
      },
      connectionTimeout: ImapClientProvider.CONNECTION_TIMEOUT_MS,
      greetingTimeout: ImapClientProvider.GREETING_TIMEOUT_MS,
    });

    client.on('error', (error) => {
      const logContext = `IMAP client error for ${connectedAccount.handle}`;

      if (this.clientsInShutdown.has(client)) {
        this.logger.warn(`${logContext} during client shutdown: ${error.message}`);

        return;
      }

      this.logger.error(logContext, error.stack);
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

  private isExpectedSocketError(error: Error): boolean {
    if (!('code' in error)) {
      return false;
    }

    return [
      MessageNetworkExceptionCode.ECONNABORTED,
      MessageNetworkExceptionCode.ECONNRESET,
      MessageNetworkExceptionCode.ETIMEDOUT,
      MessageNetworkExceptionCode.EHOSTUNREACH,
    ].includes(error.code as MessageNetworkExceptionCode);
  }
}
