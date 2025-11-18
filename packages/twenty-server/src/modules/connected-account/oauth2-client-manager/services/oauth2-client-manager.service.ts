import { Injectable } from '@nestjs/common';

import { type Client } from '@microsoft/microsoft-graph-client';
import { type Auth } from 'googleapis';

import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
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
    return this.microsoftOAuth2ClientManagerService.getOAuth2Client(
      connectedAccount.accessToken,
    );
  }
}
