import { Injectable } from '@nestjs/common';

import { OAuth2Client } from 'google-auth-library';
import { calendar_v3 as calendarV3, google } from 'googleapis';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class GoogleCalendarClientProvider {
  constructor(private readonly environmentService: EnvironmentService) {}

  public async getGoogleCalendarClient(
    refreshToken: string,
  ): Promise<calendarV3.Calendar> {
    const oAuth2Client = await this.getOAuth2Client(refreshToken);

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    return googleCalendarClient;
  }

  private async getOAuth2Client(refreshToken: string): Promise<OAuth2Client> {
    const googleCalendarClientId = this.environmentService.get(
      'AUTH_GOOGLE_CLIENT_ID',
    );
    const googleCalendarClientSecret = this.environmentService.get(
      'AUTH_GOOGLE_CLIENT_SECRET',
    );

    const oAuth2Client = new google.auth.OAuth2(
      googleCalendarClientId,
      googleCalendarClientSecret,
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    return oAuth2Client;
  }
}
