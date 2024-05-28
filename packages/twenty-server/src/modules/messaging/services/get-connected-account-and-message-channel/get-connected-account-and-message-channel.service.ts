import { Injectable } from '@nestjs/common';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';

@Injectable()
export class GetConnectedAccountAndMessageChannelService {
  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
  ) {}

  public async getConnectedAccountAndMessageChannelOrThrow(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<{
    messageChannel: ObjectRecord<MessageChannelWorkspaceEntity>;
    connectedAccount: ObjectRecord<ConnectedAccountWorkspaceEntity>;
  }> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const messageChannel =
      await this.messageChannelRepository.getFirstByConnectedAccountId(
        connectedAccountId,
        workspaceId,
      );

    if (!messageChannel) {
      throw new Error(
        `No message channel found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    return {
      messageChannel,
      connectedAccount,
    };
  }
}
