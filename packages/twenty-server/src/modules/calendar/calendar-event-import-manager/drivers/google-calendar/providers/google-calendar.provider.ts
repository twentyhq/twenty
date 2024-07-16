import { Injectable } from '@nestjs/common';

import { calendar_v3 as calendarV3, google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GoogleCalendarClientProvider {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getGoogleCalendarClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken'
    >,
  ): Promise<calendarV3.Calendar> {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getOAuth2Client(connectedAccount);

    const googleCalendarClient = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    return googleCalendarClient;
  }
}
