import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';

import {
  MessageChannelSubscriptionDriver,
  SubscriptionSetupResult,
} from 'src/modules/messaging/message-channel-subscription-manager/drivers/interfaces/message-channel-subscription-driver.interface';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageChannelSubscriptionMappingService } from 'src/modules/messaging/message-channel-subscription-manager/services/message-channel-subscription-mapping.service';

@Injectable()
export class GmailSubscriptionDriverService
  implements MessageChannelSubscriptionDriver
{
  private readonly logger = new Logger(GmailSubscriptionDriverService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly mappingService: MessageChannelSubscriptionMappingService,
  ) {}

  async setupSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<SubscriptionSetupResult> {
    const projectId = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_PROJECT_ID',
    );
    const topicName = this.twentyConfigService.get(
      'MESSAGING_GMAIL_PUBSUB_TOPIC_NAME',
    );

    if (!projectId || !topicName) {
      throw new Error(
        'Gmail Pub/Sub configuration missing: MESSAGING_GMAIL_PUBSUB_PROJECT_ID or MESSAGING_GMAIL_PUBSUB_TOPIC_NAME',
      );
    }

    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    this.logger.log(
      `Setting up Gmail watch for account ${connectedAccount.handle} (workspace: ${workspaceId})`,
    );

    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${projectId}/topics/${topicName}`,
        labelIds: ['INBOX'],
      },
    });

    if (!response.data.expiration || !response.data.historyId) {
      throw new Error(
        `Gmail watch response missing required fields: expiration=${response.data.expiration}, historyId=${response.data.historyId}`,
      );
    }

    const expiresAt = new Date(Number(response.data.expiration));

    if (!connectedAccount.handle) {
      throw new Error(
        `Connected account ${connectedAccount.id} has no handle (email address)`,
      );
    }

    await this.mappingService.setMapping(
      connectedAccount.handle,
      workspaceId,
      messageChannel.id,
    );

    this.logger.log(
      `Gmail watch set up successfully for ${connectedAccount.handle}, expires at ${expiresAt.toISOString()}`,
    );

    return {
      providerSubscriptionId: response.data.historyId,
      expiresAt,
    };
  }

  async stopSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    this.logger.log(
      `Stopping Gmail watch for account ${connectedAccount.handle} (workspace: ${workspaceId})`,
    );

    try {
      await gmail.users.stop({ userId: 'me' });
    } catch (error) {
      this.logger.warn(
        `Failed to stop Gmail watch for ${connectedAccount.handle}: ${error.message}`,
      );
    }

    if (connectedAccount.handle) {
      await this.mappingService.removeMapping(
        connectedAccount.handle,
        workspaceId,
      );
    }

    this.logger.log(
      `Gmail watch stopped for ${connectedAccount.handle} (workspace: ${workspaceId})`,
    );
  }

  async renewSubscription(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<SubscriptionSetupResult> {
    this.logger.log(
      `Renewing Gmail watch for account ${connectedAccount.handle} (workspace: ${workspaceId})`,
    );

    return this.setupSubscription(
      connectedAccount,
      messageChannel,
      workspaceId,
    );
  }
}
