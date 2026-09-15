import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';

const GRAPH_SENT_MAIL_FOLDER_ID = 'sentitems';

@Injectable()
export class MicrosoftRecentMessagesService {
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
  ) {}

  async getExternalIds({
    connectedAccountId,
    maxCount,
  }: {
    connectedAccountId: string;
    maxCount: number;
  }): Promise<string[]> {
    const microsoftClient =
      await this.microsoftOAuth2ClientProvider.getClient(connectedAccountId);

    const response: { value?: { id?: string }[] } = await microsoftClient
      .api(
        `/me/mailFolders/${GRAPH_SENT_MAIL_FOLDER_ID}/messages?$select=id&$orderby=sentDateTime desc&$top=${maxCount}`,
      )
      .header('Prefer', 'IdType="ImmutableId"')
      .get();

    return (response?.value ?? [])
      .map((message) => message.id)
      .filter(isDefined);
  }
}
