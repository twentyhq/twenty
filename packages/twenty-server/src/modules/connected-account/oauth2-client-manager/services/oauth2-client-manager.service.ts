import { Injectable } from '@nestjs/common';

import { type Client } from '@microsoft/microsoft-graph-client';
import { type Auth } from 'googleapis';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerExceptionCode } from 'src/modules/connected-account/oauth2-client-manager/exceptions/oauth2-client-manager.exceptions';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class OAuth2ClientManagerService {
  constructor(
    private readonly googleOAuth2ClientManagerService: GoogleOAuth2ClientManagerService,
    private readonly microsoftOAuth2ClientManagerService: MicrosoftOAuth2ClientManagerService,
  ) {}

  public async getGoogleOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<Auth.OAuth2Client> {
    if (!isDefined(connectedAccount.refreshToken)) {
      throw new CustomError(
        'Refresh token is required',
        OAuth2ClientManagerExceptionCode.REFRESH_TOKEN_REQUIRED,
      );
    }

    return this.googleOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.refreshToken,
    );
  }

  public async getMicrosoftOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'accessToken'
    >,
  ): Promise<Client> {
    if (!isDefined(connectedAccount.accessToken)) {
      throw new CustomError(
        'Access token is required',
        OAuth2ClientManagerExceptionCode.ACCESS_TOKEN_REQUIRED,
      );
    }

    return this.microsoftOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.accessToken,
    );
  }
}
