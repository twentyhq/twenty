import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import {
  ConnectedAccountRefreshTokensService,
  ConnectedAccountTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

interface ValidateAndRefreshConnectedAccountAuthenticationParams {
  connectedAccount: ConnectedAccountWorkspaceEntity;
  workspaceId: string;
  messageChannelId: string;
}

@Injectable()
export class MessagingAccountAuthenticationService {
  constructor(
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
  ) {}

  async validateAndRefreshConnectedAccountAuthentication({
    connectedAccount,
    workspaceId,
    messageChannelId,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<ConnectedAccountTokens> {
    if (
      connectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      isDefined(connectedAccount.connectionParameters?.IMAP)
    ) {
      await this.validateImapCredentialsForConnectedAccount({
        connectedAccount,
        workspaceId,
        messageChannelId,
      });

      return {
        accessToken: '',
        refreshToken: '',
      };
    }

    return await this.refreshAccessTokenForNonImapProvider({
      connectedAccount,
      workspaceId,
      messageChannelId,
    });
  }

  private async validateImapCredentialsForConnectedAccount({
    connectedAccount,
    workspaceId,
    messageChannelId,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<void> {
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

  private async refreshAccessTokenForNonImapProvider({
    connectedAccount,
    workspaceId,
    messageChannelId,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<ConnectedAccountTokens> {
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
            connectedAccountId: connectedAccount.id,
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
