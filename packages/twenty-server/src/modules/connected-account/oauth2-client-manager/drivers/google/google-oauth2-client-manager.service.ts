import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GoogleOAuth2ClientManagerService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  public async getOAuth2Client(refreshToken: string): Promise<OAuth2Client> {
    const gmailClientId = this.twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID');
    const gmailClientSecret = this.twentyConfigService.get(
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
