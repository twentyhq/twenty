import { Injectable } from '@nestjs/common';

import { Client } from '@microsoft/microsoft-graph-client';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

import { MicrosoftOAuth2AuthProviderService } from './microsoft-oauth2-auth-provider.service';

@Injectable()
export class MicrosoftOAuth2ClientManagerService {
  constructor(
    private readonly microsoftOAuth2AuthProviderService: MicrosoftOAuth2AuthProviderService,
  ) {}

  public async getOAuth2Client(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'accessToken' | 'id'
    >,
  ): Promise<Client> {
    const authProvider =
      this.microsoftOAuth2AuthProviderService.createAuthProvider(
        connectedAccount,
      );

    const client = Client.init({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider,
    });

    return client;
  }
}
