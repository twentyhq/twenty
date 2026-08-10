import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { RECENT_MESSAGES_SEARCH_SCOPES } from 'src/modules/onboarding-recent-messages-import/constants/recent-messages-search-scopes.constant';

const GRAPH_MAIL_FOLDER_BY_SEARCH_SCOPE = {
  sent: { folderId: 'sentitems', orderByField: 'sentDateTime' },
  inbox: { folderId: 'inbox', orderByField: 'receivedDateTime' },
} as const;

@Injectable()
export class MicrosoftRecentMessagesService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async getExternalIds({
    connectedAccountId,
    maxCountPerScope,
  }: {
    connectedAccountId: string;
    maxCountPerScope: number;
  }): Promise<string[]> {
    const microsoftClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const messageExternalIdsByScope = await Promise.all(
      RECENT_MESSAGES_SEARCH_SCOPES.map(async (searchScope) => {
        const { folderId, orderByField } =
          GRAPH_MAIL_FOLDER_BY_SEARCH_SCOPE[searchScope];

        const response: { value?: { id?: string }[] } = await microsoftClient
          .api(
            `/me/mailFolders/${folderId}/messages?$select=id&$orderby=${orderByField} desc&$top=${maxCountPerScope}`,
          )
          .header('Prefer', 'IdType="ImmutableId"')
          .get();

        return (response?.value ?? [])
          .map((message) => message.id)
          .filter(isDefined);
      }),
    );

    return messageExternalIdsByScope.flat();
  }
}
