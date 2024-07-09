import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GoogleEmailAliasManagerService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
  ) {}

  public async getHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getOAuth2Client(connectedAccount);

    const people = google.people({
      version: 'v1',
      auth: oAuth2Client,
    });

    const emailsResponse = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses',
    });

    const emailAddresses = emailsResponse.data.emailAddresses;

    const handleAliases =
      emailAddresses
        ?.filter((emailAddress) => {
          return emailAddress.metadata?.primary !== true;
        })
        .map((emailAddress) => {
          return emailAddress.value || '';
        }) || [];

    return handleAliases;
  }
}
