import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { ONBOARDING_FIRST_MESSAGES_SEARCH_SCOPES } from 'src/modules/onboarding-first-messages/constants/onboarding-first-messages-search-scopes.constant';

const GRAPH_FOLDER_BY_SCOPE = {
  sent: { id: 'sentitems', dateField: 'sentDateTime' },
  inbox: { id: 'inbox', dateField: 'receivedDateTime' },
} as const;

@Injectable()
export class MicrosoftFirstMessagesService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async getFirstMessageExternalIds({
    connectedAccountId,
    maxCountPerScope,
  }: {
    connectedAccountId: string;
    maxCountPerScope: number;
  }): Promise<string[]> {
    const microsoftClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const messageExternalIdsByScope = await Promise.all(
      ONBOARDING_FIRST_MESSAGES_SEARCH_SCOPES.map(async (scope) => {
        const { id, dateField } = GRAPH_FOLDER_BY_SCOPE[scope];

        const response: { value?: { id?: string }[] } = await microsoftClient
          .api(
            `/me/mailFolders/${id}/messages?$select=id&$orderby=${dateField} desc&$top=${maxCountPerScope}`,
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
