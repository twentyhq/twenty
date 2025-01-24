import { Injectable } from '@nestjs/common';

import {
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';

import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import {
  GetFullMessageListResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';

// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
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

    await pageIterator.iterate().catch((error) => {
      this.microsoftHandleErrorService.handleMicrosoftMessageFetchError(error);
    });

    return {
      messageExternalIds: messageExternalIds,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
    };
  }

  public async getPartialMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    syncCursor: string,
  ): Promise<GetPartialMessageListResponse> {
    // important: otherwise tries to get the full message list
    if (!syncCursor) {
      throw new MessageImportDriverException(
        'Missing SyncCursor',
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );
    }

    const messageExternalIds: string[] = [];
    const messageExternalIdsToDelete: string[] = [];

    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    const response: PageCollection = await microsoftClient
      .api(syncCursor)
      .version('beta')
      .headers({
        Prefer: `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`,
      })
      .get();

    const callback: PageIteratorCallback = (data) => {
      if (data['@removed']) {
        messageExternalIdsToDelete.push(data.id);
      } else {
        messageExternalIds.push(data.id);
      }

      return true;
    };

    const pageIterator = new PageIterator(microsoftClient, response, callback);

    await pageIterator.iterate().catch((error) => {
      this.microsoftHandleErrorService.handleMicrosoftMessageFetchError(error);
    });

    return {
      messageExternalIds,
      messageExternalIdsToDelete,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
    };
  }
}
