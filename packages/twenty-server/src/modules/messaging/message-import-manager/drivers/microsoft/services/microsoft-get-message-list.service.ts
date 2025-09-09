import { Injectable, Logger } from '@nestjs/common';

import {
  PageIterator,
  type PageCollection,
  type PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { isNonEmptyString } from '@sniptt/guards';

import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetMessageListService {
  private readonly logger = new Logger(MicrosoftGetMessageListService.name);
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
  ) {}

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const result: GetMessageListsResponse = [];

    if (messageFolders.length === 0) {
      throw new MessageImportDriverException(
        `Message channel ${messageChannel.id} has no message folders`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    const syncedMessageFolders = messageFolders.filter(
      (folder) => folder.isSynced,
    );

    for (const folder of syncedMessageFolders) {
      const response = await this.getMessageList(connectedAccount, folder);

      result.push({
        ...response,
        folderId: folder.id,
      });
    }

    return result;
  }

  public async getMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    messageFolder: Pick<
      MessageFolderWorkspaceEntity,
      'name' | 'syncCursor' | 'externalId'
    >,
  ): Promise<GetOneMessageListResponse> {
    const messageExternalIds: string[] = [];
    const messageExternalIdsToDelete: string[] = [];

    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    const folderId = messageFolder.externalId || messageFolder.name;
    const apiUrl = isNonEmptyString(messageFolder.syncCursor)
      ? messageFolder.syncCursor
      : `/me/mailfolders/${folderId}/messages/delta?$select=id`;

    const response: PageCollection = await microsoftClient
      .api(apiUrl)
      .version('beta')
      .headers({
        Prefer: `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`,
      })
      .get()
      .catch((error) => {
        this.logger.error(
          `Connected account ${connectedAccount.id}: Error fetching message list: ${JSON.stringify(error)}`,
        );
        if (isAccessTokenRefreshingError(error?.body)) {
          throw new MessageImportDriverException(
            error.message,
            MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
          );
        }
        this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
          error,
        );
      });

    const callback: PageIteratorCallback = (data) => {
      if (data['@removed']) {
        messageExternalIdsToDelete.push(data.id);
      } else {
        messageExternalIds.push(data.id);
      }

      return true;
    };

    const pageIterator = new PageIterator(microsoftClient, response, callback, {
      headers: {
        Prefer: `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`,
      },
    });

    await pageIterator.iterate().catch((error) => {
      if (isAccessTokenRefreshingError(error?.body)) {
        throw new MessageImportDriverException(
          error.message,
          MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE,
        );
      }
      this.microsoftHandleErrorService.handleMicrosoftGetMessageListError(
        error,
      );
    });

    return {
      messageExternalIds,
      messageExternalIdsToDelete,
      previousSyncCursor: messageFolder.syncCursor,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
      folderId: undefined,
    };
  }
}
