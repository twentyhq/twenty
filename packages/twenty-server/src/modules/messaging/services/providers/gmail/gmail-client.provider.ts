import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GmailClientProvider {
  constructor(private readonly environmentService: EnvironmentService) {}

  public async getGmailClient(refreshToken: string): Promise<gmail_v1.Gmail> {
    const oAuth2Client = await this.getOAuth2Client(refreshToken);

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    return gmailClient;
  }

  private async getOAuth2Client(refreshToken: string): Promise<OAuth2Client> {
    const gmailClientId = this.environmentService.get('AUTH_GOOGLE_CLIENT_ID');
    const gmailClientSecret = this.environmentService.get(
      'AUTH_GOOGLE_CLIENT_SECRET',
    );

    const oAuth2Client = new google.auth.OAuth2(
      gmailClientId,
      gmailClientSecret,
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oAuth2Client;
  }
}
