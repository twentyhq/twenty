import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

interface ImapClientInstance {
  client: ImapFlow;
  isReady: boolean;
}

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);
  private readonly clientInstances = new Map<string, ImapClientInstance>();

  constructor() {}

  async getClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'id' | 'provider' | 'connectionParameters' | 'handle'
    >,
  ): Promise<ImapFlow> {
    const cacheKey = `${connectedAccount.id}`;

    if (this.clientInstances.has(cacheKey)) {
      const instance = this.clientInstances.get(cacheKey);

      if (instance?.isReady) {
        return instance.client;
      }
    }

    if (
      connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
      !isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      throw new Error('Connected account is not an IMAP provider');
    }

    const connectionParameters: ImapSmtpCaldavParams =
      (connectedAccount.connectionParameters as unknown as ImapSmtpCaldavParams) ||
      {};

    const client = new ImapFlow({
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

    try {
      await client.connect();

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

      this.clientInstances.set(cacheKey, {
        client,
        isReady: true,
      });

      return client;
    } catch (error) {
      this.logger.error(
        `Failed to connect to IMAP server: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async closeClient(connectedAccountId: string): Promise<void> {
    const cacheKey = `${connectedAccountId}`;
    const instance = this.clientInstances.get(cacheKey);

    if (instance?.isReady) {
      try {
        await instance.client.logout();
        this.logger.log('Closed IMAP client');
      } catch (error) {
        this.logger.error(`Error closing IMAP client: ${error.message}`);
      } finally {
        this.clientInstances.delete(cacheKey);
      }
    }
  }
}
