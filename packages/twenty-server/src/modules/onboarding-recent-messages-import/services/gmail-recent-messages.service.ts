import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

const GMAIL_SENT_SEARCH_FILTER = 'in:sent';

@Injectable()
export class GmailRecentMessagesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  async getExternalIds({
    connectedAccountId,
    maxCount,
  }: {
    connectedAccountId: string;
    maxCount: number;
  }): Promise<string[]> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageList = await gmailClient.users.messages.list({
      userId: 'me',
      maxResults: maxCount,
      q: GMAIL_SENT_SEARCH_FILTER,
    });

    return (messageList.data.messages ?? [])
      .map((message) => message.id)
      .filter(isDefined);
  }
}
