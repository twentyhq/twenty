import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async getClient(connectedAccountId: string): Promise<ImapFlow> {
    const connectedAccount =
      await this.loadConnectedAccount(connectedAccountId);

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

  private async loadConnectedAccount(
    connectedAccountId: string,
  ): Promise<ConnectedAccountEntity> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId },
    });

    if (
      !isDefined(connectedAccount) ||
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
      !isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      throw new MessageImportDriverException(
        `Missing IMAP credentials for connected account ${connectedAccountId}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    return connectedAccount;
  }

  private async createConnection(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<ImapFlow> {
    if (!isDefined(connectedAccount.connectionParameters?.IMAP)) {
      throw new Error('Connected account is not an IMAP provider');
    }

    const imapParams =
      this.connectedAccountTokenEncryptionService.decryptProtocolPassword({
        protocolParams: connectedAccount.connectionParameters.IMAP,
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
        pass: imapParams.password,
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
