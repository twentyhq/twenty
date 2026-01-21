import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapAuthenticationError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-authentication-error.util';

type ConnectedAccountIdentifier = Pick<
  ConnectedAccountWorkspaceEntity,
  'id' | 'provider' | 'connectionParameters' | 'handle'
>;

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);

  private static readonly CONNECTION_TIMEOUT_MS = 30000;
  private static readonly GREETING_TIMEOUT_MS = 16000;

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

    const client = new ImapFlow({
      host: connectionParameters.IMAP?.host || '',
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
