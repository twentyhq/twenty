import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessagingTelemetryService } from 'src/modules/messaging/common/services/messaging-telemetry.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingChannelSyncStatusService } from 'src/modules/messaging/common/services/messaging-channel-sync-status.service';

@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelRepository: MessageChannelRepository,
    private readonly messagingTelemetryService: MessagingTelemetryService,
    private readonly messagingChannelSyncStatusService: MessagingChannelSyncStatusService,
  ) {}

  async refreshAndSaveAccessToken(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<void> {
    const connectedAccount = await this.connectedAccountRepository.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `No connected account found for ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error(
        `No refresh token found for connected account ${connectedAccountId} in workspace ${workspaceId}`,
      );
    }

    try {
      const accessToken = await this.refreshAccessToken(refreshToken);

      await this.connectedAccountRepository.updateAccessToken(
        accessToken,
        connectedAccountId,
        workspaceId,
      );
    } catch (error) {
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

      await this.messagingTelemetryService.track({
        eventName: `refresh_token.error.insufficient_permissions`,
        workspaceId,
        connectedAccountId: messageChannel.connectedAccountId,
        messageChannelId: messageChannel.id,
        message: `${error.code}: ${error.reason}`,
      });

      await this.messagingChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
        messageChannel.id,
        workspaceId,
      );

      await this.connectedAccountRepository.updateAuthFailedAt(
        messageChannel.connectedAccountId,
        workspaceId,
      );
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: this.environmentService.get('AUTH_GOOGLE_CLIENT_ID'),
        client_secret: this.environmentService.get('AUTH_GOOGLE_CLIENT_SECRET'),
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.access_token;
  }
}
