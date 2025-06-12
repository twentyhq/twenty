import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ImapConnectionParams } from 'src/engine/core-modules/imap-connection/types/imap-connection.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

interface ImapClientInstance {
  client: ImapFlow;
  isReady: boolean;
}

@Injectable()
export class ImapClientProvider {
  private readonly logger = new Logger(ImapClientProvider.name);
  private readonly clientInstances = new Map<string, ImapClientInstance>();

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async getClient(
    workspaceId: string,
    messageChannelId: string,
  ): Promise<ImapFlow> {
    const cacheKey = `${workspaceId}-${messageChannelId}`;

    if (this.clientInstances.has(cacheKey)) {
      const instance = this.clientInstances.get(cacheKey);

      if (instance?.isReady) {
        return instance.client;
      }
    }

    const messageChannelRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
        workspaceId,
        'messageChannel',
      );

    const messageChannel = await messageChannelRepository.findOneOrFail({
      where: { id: messageChannelId },
    });

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOneOrFail({
      where: { id: messageChannel.connectedAccountId },
    });

    if (connectedAccount.provider !== ConnectedAccountProvider.IMAP) {
      throw new Error('Connected account is not an IMAP provider');
    }

    const customConnectionParams: ImapConnectionParams =
      (connectedAccount.customConnectionParams as unknown as ImapConnectionParams) ||
      {};

    const client = new ImapFlow({
      host: customConnectionParams.host || '',
      port: customConnectionParams.port || 993,
      secure: customConnectionParams.secure,
      auth: {
        user: customConnectionParams.handle,
        pass: customConnectionParams.password || '',
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

  async closeClient(
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    const cacheKey = `${workspaceId}-${messageChannelId}`;
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
