import { Injectable } from '@nestjs/common';

import {
  AuthProvider,
  AuthProviderCallback,
  Client,
} from '@microsoft/microsoft-graph-client';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class MicrosoftOAuth2ClientManagerService {
  constructor(private readonly environmentService: EnvironmentService) {}

  public async getOAuth2Client(refreshToken: string): Promise<Client> {
    const authProvider: AuthProvider = async (
      callback: AuthProviderCallback,
    ) => {
      try {
        const tenantId = this.environmentService.get(
          'AUTH_MICROSOFT_TENANT_ID',
        );

        const urlData = new URLSearchParams();

        urlData.append(
          'client_id',
          this.environmentService.get('AUTH_MICROSOFT_CLIENT_ID'),
        );
        urlData.append('scope', 'https://graph.microsoft.com/.default');
        urlData.append('refresh_token', refreshToken);
        urlData.append(
          'client_secret',
          this.environmentService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
        );
        urlData.append('grant_type', 'refresh_token');

        const res = await fetch(
          `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
          {
            method: 'POST',
            body: urlData,
          },
        );

        const data = await res.json();

        callback(null, data.access_token);
      } catch (error) {
        callback(error, null);
      }
    };

    const client = Client.init({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider: authProvider,
    });

    return client;
  }
}
