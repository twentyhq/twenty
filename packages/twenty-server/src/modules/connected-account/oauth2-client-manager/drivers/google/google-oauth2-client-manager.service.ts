import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class GoogleOAuth2ClientManagerService {
  constructor(private readonly environmentService: EnvironmentService) {}

  public async getOAuth2Client(refreshToken: string): Promise<OAuth2Client> {
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
