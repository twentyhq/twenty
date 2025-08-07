import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import {
  ConnectedAccountRefreshTokensService,
  ConnectedAccountTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

@Injectable()
export class MessagingAccountAuthenticationService {
  private readonly logger = new Logger(
    MessagingAccountAuthenticationService.name,
  );
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
      await this.validateImapCredentialsForConnectedAccount(
        messageChannel.connectedAccount,
        workspaceId,
        messageChannel.id,
      );

      return;
    }

    await this.refreshAccessTokenForNonImapProvider(
      messageChannel.connectedAccount,
      workspaceId,
      messageChannel.id,
      messageChannel.connectedAccountId,
    );
  }

  async validateAndRefreshConnectedAccountAuthentication(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    messageChannelId: string,
  ): Promise<ConnectedAccountTokens> {
    if (
      connectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      await this.validateImapCredentialsForConnectedAccount(
        connectedAccount,
        workspaceId,
        messageChannelId,
      );

      return {
        accessToken: '',
        refreshToken: '',
      };
    }

    return await this.refreshAccessTokenForNonImapProvider(
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
    if (
      !isDefined(connectedAccount.connectionParameters) ||
      !isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
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

  private async refreshAccessTokenForNonImapProvider(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    messageChannelId: string,
    connectedAccountId: string,
  ): Promise<ConnectedAccountTokens> {
    try {
      return await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
        connectedAccount,
        workspaceId,
      );
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
