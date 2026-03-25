import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { ConnectedAccountRefreshAccessTokenExceptionCode } from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import {
  ConnectedAccountRefreshTokensService,
  type ConnectedAccountTokens,
} from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

interface ValidateAndRefreshConnectedAccountAuthenticationParams {
  connectedAccount: ConnectedAccountWorkspaceEntity;
  workspaceId: string;
  calendarChannelId: string;
}

@Injectable()
export class CalendarAccountAuthenticationService {
  constructor(
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
  ) {}

  async validateAndRefreshConnectedAccountAuthentication({
    connectedAccount,
    workspaceId,
    calendarChannelId: messageChannelId,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<ConnectedAccountTokens> {
    if (
      connectedAccount.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV &&
      isDefined(connectedAccount.connectionParameters?.CALDAV)
    ) {
      await this.validateCalDavCredentialsForConnectedAccount({
        connectedAccount,
        workspaceId,
        calendarChannelId: messageChannelId,
      });

      return {
        accessToken: '',
        refreshToken: '',
      };
    }

    return await this.refreshAccessTokenForOAuthProvider({
      connectedAccount,
      workspaceId,
      calendarChannelId: messageChannelId,
    });
  }

  private async validateCalDavCredentialsForConnectedAccount({
    connectedAccount,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<void> {
    if (
      !isDefined(connectedAccount.connectionParameters) ||
      !isDefined(connectedAccount.connectionParameters?.CALDAV)
    ) {
      throw {
        code: CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        message: 'Missing CALDAV credentials in connectionParameters',
      };
    }
  }

  private async refreshAccessTokenForOAuthProvider({
    connectedAccount,
    workspaceId,
  }: ValidateAndRefreshConnectedAccountAuthenticationParams): Promise<ConnectedAccountTokens> {
    try {
      return await this.connectedAccountRefreshTokensService.refreshAndSaveTokens(
        connectedAccount,
        workspaceId,
      );
    } catch (error) {
      switch (error.code) {
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
          throw new CalendarEventImportDriverException(
            error.message,
            CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
          );
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
          throw new CalendarEventImportDriverException(
            error.message,
            CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          );
        default:
          throw error;
      }
    }
  }
}
