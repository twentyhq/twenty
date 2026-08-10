import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';
import { isDefined } from 'twenty-shared/utils';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { ONBOARDING_FIRST_MESSAGES_SEARCH_SCOPES } from 'src/modules/onboarding-first-messages/constants/onboarding-first-messages-search-scopes.constant';

@Injectable()
export class GmailFirstMessagesService {
  constructor(
    private readonly googleOAuth2ClientProvider: GoogleOAuth2ClientProvider,
  ) {}

  async getFirstMessageExternalIds({
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
      ONBOARDING_FIRST_MESSAGES_SEARCH_SCOPES.map(async (scope) => {
        const messageList = await gmailClient.users.messages.list({
          userId: 'me',
          maxResults: maxCountPerScope,
          q: `in:${scope}`,
        });

        return (messageList.data.messages ?? [])
          .map((message) => message.id)
          .filter(isDefined);
      }),
    );

    return messageExternalIdsByScope.flat();
  }
}
