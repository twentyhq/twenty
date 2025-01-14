import { Injectable } from '@nestjs/common';

import {
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { GetFullMessageListResponse } from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

// Microsoft API limit is 1000 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 1000;

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
  ) {}

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor?: string,
  ): Promise<GetFullMessageListResponse> {
    const messageExternalIds: string[] = [];

    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    const response: PageCollection = await microsoftClient
      .api(syncCursor || '/me/mailfolders/inbox/messages/delta?$select=id')
      .version('beta')
      .headers({
        Prefer: `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`,
      })
      .get();

    const callback: PageIteratorCallback = (data) => {
      messageExternalIds.push(data.id);

      return true;
    };

    const pageIterator = new PageIterator(microsoftClient, response, callback);

    await pageIterator.iterate();

    return {
      messageExternalIds: messageExternalIds,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
    };
  }
}
