import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { RECENT_MESSAGES_SEARCH_SCOPES } from 'src/modules/onboarding-recent-messages-import/constants/recent-messages-search-scopes.constant';

@Injectable()
export class GmailRecentMessagesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  async getExternalIds({
    connectedAccountId,
    maxCountPerScope,
  }: {
    connectedAccountId: string;
    maxCountPerScope: number;
  }): Promise<string[]> {
    const oAuth2Client =
      await this.googleOAuth2ClientProvider.getClient(connectedAccountId);

    const gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageExternalIdsByScope = await Promise.all(
      RECENT_MESSAGES_SEARCH_SCOPES.map(async (searchScope) => {
        const messageList = await gmailClient.users.messages.list({
          userId: 'me',
          maxResults: maxCountPerScope,
          q: `in:${searchScope}`,
        });

        return (messageList.data.messages ?? [])
          .map((message) => message.id)
          .filter(isDefined);
      }),
    );

    return messageExternalIdsByScope.flat();
  }
}
