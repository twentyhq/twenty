import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

@Injectable()
export class MessagingAccountAuthenticationService {
  constructor(
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
  ) {}

  async validateAndPrepareAuthentication(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (
      messageChannel.connectedAccount.provider ===
      ConnectedAccountProvider.IMAP_SMTP_CALDAV
    ) {
      await this.validateImapCredentials(messageChannel, workspaceId);

      return;
    }

    await this.refreshAccessTokenForNonImapProvider(
      messageChannel.connectedAccount,
      workspaceId,
      messageChannel.id,
      messageChannel.connectedAccountId,
    );
  }

  async validateConnectedAccountAuthentication(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    if (
      connectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      await this.validateImapCredentialsForConnectedAccount(
        connectedAccount,
        workspaceId,
        messageChannelId,
      );

      return;
    }

    await this.refreshAccessTokenForNonImapProvider(
      connectedAccount,
      workspaceId,
      messageChannelId,
      connectedAccount.id,
    );
  }

  private async validateImapCredentialsForConnectedAccount(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<void> {
    if (!connectedAccount.connectionParameters) {
      await this.messagingMonitoringService.track({
        eventName: 'messages_import.error.missing_imap_credentials',
        workspaceId,
        connectedAccountId: connectedAccount.id,
        messageChannelId,
      });

      throw {
        code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        message: 'Missing IMAP credentials in connectionParameters',
      };
    }
  }

  private async validateImapCredentials(
    messageChannel: MessageChannelWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    if (
      !isDefined(messageChannel.connectedAccount.connectionParameters?.IMAP)
    ) {
      await this.messagingMonitoringService.track({
        eventName: 'message_list_fetch_job.error.missing_imap_credentials',
        workspaceId,
        connectedAccountId: messageChannel.connectedAccount.id,
        messageChannelId: messageChannel.id,
      });

      throw {
        code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        message: 'Missing IMAP credentials in connectionParameters',
      };
    }
  }

  private async refreshAccessTokenForNonImapProvider(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    messageChannelId: string,
    connectedAccountId: string,
  ): Promise<string> {
    try {
      const accessToken =
        await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
          connectedAccount,
          workspaceId,
        );

      return accessToken;
    } catch (error) {
      switch (error.code) {
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
          throw new MessageImportDriverException(
            error.message,
            MessageImportDriverExceptionCode.TEMPORARY_ERROR,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_ACCESS_TOKEN_FAILED:
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
          await this.messagingMonitoringService.track({
            eventName: `refresh_token.error.insufficient_permissions`,
            workspaceId,
            connectedAccountId,
            messageChannelId,
            message: `${error.code}: ${error.reason ?? ''}`,
          });
          throw new MessageImportDriverException(
            error.message,
            MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
          throw new MessageImportDriverException(
            error.message,
            MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED,
          );
        default:
          throw error;
      }
    }
  }
}
