import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { GmailEmailAliasErrorHandlerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-error-handler.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class GoogleEmailAliasManagerService {
  constructor(
    private readonly oAuth2ClientManagerService: OAuth2ClientManagerService,
    private readonly gmailEmailAliasErrorHandlerService: GmailEmailAliasErrorHandlerService,
  ) {}

  public async getHandleAliases(
    connectedAccount: ConnectedAccountWorkspaceEntity,
  ) {
    const oAuth2Client =
      await this.oAuth2ClientManagerService.getGoogleOAuth2Client(
        connectedAccount,
      );

    const peopleClient = google.people({
      version: 'v1',
      auth: oAuth2Client,
    });

    const emailsResponse = await peopleClient.people
      .get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
      })
      .catch((error) => {
        throw this.gmailEmailAliasErrorHandlerService.handleError(error);
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
