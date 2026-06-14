import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { GmailEmailAliasErrorHandlerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-error-handler.service';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class GoogleEmailAliasManagerService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
    private readonly gmailEmailAliasErrorHandlerService: GmailEmailAliasErrorHandlerService,
  ) {}

  public async getHandleAliases(connectedAccount: ConnectedAccountEntity) {
    const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    const sendAsResponse = await gmailClient.users.settings.sendAs
      .list({ userId: 'me' })
      .catch((error) => {
        throw this.gmailEmailAliasErrorHandlerService.handleError(error);
      });

    return (
      sendAsResponse.data.sendAs
        ?.filter((alias) => alias.isPrimary !== true)
        .map((alias) => alias.sendAsEmail || '')
        .filter((email) => email.length > 0) ?? []
    );
  }
}
