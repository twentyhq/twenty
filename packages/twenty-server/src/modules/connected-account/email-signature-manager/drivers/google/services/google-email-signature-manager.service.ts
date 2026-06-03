import { Injectable, Logger } from '@nestjs/common';

import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Injectable()
export class GoogleEmailSignatureManagerService {
  private readonly logger = new Logger(GoogleEmailSignatureManagerService.name);

  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  // Reads the sender's default Gmail signature through the sendAs settings API.
  // The Gmail API only exposes a single signature per send-as address (the
  // default for new mail) - Gmail's multiple-signatures feature is not exposed.
  // Reading sendAs settings only needs the gmail.readonly scope, which connected
  // Google accounts already hold. Never throws: a signature must not be able to
  // block sending.
  public async getSignature(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<string | undefined> {
    try {
      const oAuth2Client = await this.googleOAuth2ClientProvider.getClient(
        connectedAccount.id,
      );

      const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

      const { data } = await gmailClient.users.settings.sendAs.list({
        userId: 'me',
      });

      const sendAsList = data.sendAs ?? [];

      const matchingSendAs =
        sendAsList.find(
          (sendAs) => sendAs.sendAsEmail === connectedAccount.handle,
        ) ?? sendAsList.find((sendAs) => sendAs.isPrimary === true);

      const signature = matchingSendAs?.signature;

      return isDefined(signature) && signature.length > 0
        ? signature
        : undefined;
    } catch (error) {
      this.logger.warn(
        `Could not fetch Gmail signature for connected account ${connectedAccount.id}: ${error}`,
      );

      return undefined;
    }
  }
}
