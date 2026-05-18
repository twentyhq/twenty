import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle' | 'workspaceId'
>;

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
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
    try {
      await client.logout();
      this.logger.log('Closed IMAP client');
    } catch (error) {
      this.logger.error(`Error closing IMAP client: ${error.message}`);
    }
  }

  private async createConnection(
    connectedAccount: ConnectedAccountIdentifier,
  ): Promise<ImapFlow> {
    const imapParams = connectedAccount.connectionParameters?.IMAP;

    if (
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
      !isDefined(imapParams)
    ) {
      throw new Error('Connected account is not an IMAP provider');
    }

    if (!isDefined(connectedAccount.handle)) {
      throw new CustomError(
        'Handle is required',
        MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED,
      );
    }

    if (!isNonEmptyString(imapParams.password)) {
      throw new Error('IMAP password is missing from connection parameters');
    }

    const decryptedPassword =
      this.connectedAccountTokenEncryptionService.decrypt({
        ciphertext: imapParams.password,
        workspaceId: connectedAccount.workspaceId,
      });

    const validatedImapHost =
      await this.secureHttpClientService.getValidatedHost(imapParams.host);

    const client = new ImapFlow({
      host: validatedImapHost,
      port: imapParams.port || 993,
      secure: imapParams.secure,
      auth: {
        user: isDefined(imapParams.username)
          ? imapParams.username
          : connectedAccount.handle,
        pass: decryptedPassword,
      },
      logger: false,
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: ImapClientProvider.CONNECTION_TIMEOUT_MS,
      greetingTimeout: ImapClientProvider.GREETING_TIMEOUT_MS,
    });

    // ImapFlow is long-lived EventEmitter — missing 'error' listener crashes process on socket timeout.
    client.on('error', (error) => {
      this.logger.error(
        `IMAP client error for ${connectedAccount.handle}: ${error.message}`,
        error.stack,
      );
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
