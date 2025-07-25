import { Injectable } from '@nestjs/common';

import {
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { isNonEmptyString } from '@sniptt/guards';
import { v4 } from 'uuid';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';
import { isAccessTokenRefreshingError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-access-token-refreshing-error.utils';
import { GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  GetMessageListsResponse,
  GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';

// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const result: GetMessageListsResponse = [];

    if (messageFolders.length === 0) {
      // permanent solution:
      // throw new MessageImportDriverException(
      //   `Message channel ${messageChannel.id} has no message folders`,
      //   MessageImportDriverExceptionCode.NOT_FOUND,
      // );

      // temporary solution: TODO: remove this once we have a permanent solution
      // if no folders exist, most probably a first time sync for microsoft
      // so we create the folders INBOX and SENTITEMS
      // and fill the INBOX with the previous sync cursor
      // and for sentitms, we do the full message list fetch
      // console.warn(
      //   `Message channel ${messageChannel.id} has no message folders, most probably a first time`,
      // );

      const messageFolderRepository =
        await this.twentyORMManager.getRepository<MessageFolderWorkspaceEntity>(
          'messageFolder',
        );

      const newFolder = await messageFolderRepository.save({
        id: v4(),
        messageChannelId: messageChannel.id,
        name: MessageFolderName.INBOX,
        syncCursor: messageChannel.syncCursor,
      });

      const response = await this.getMessageList(connectedAccount, {
        name: MessageFolderName.INBOX,
        syncCursor: messageChannel.syncCursor,
      });

      result.push({
        ...response,
        folderId: newFolder.id,
      });

      // we are ok with not synchronizing the legacy connected microsoft accounts.
      // so we return an empty array.
      return result;
    }

    for (const folder of messageFolders) {
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
    messageFolder: Pick<MessageFolderWorkspaceEntity, 'name' | 'syncCursor'>,
  ): Promise<GetOneMessageListResponse> {
    const messageExternalIds: string[] = [];
    const messageExternalIdsToDelete: string[] = [];

    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    const apiUrl = isNonEmptyString(messageFolder.syncCursor)
      ? messageFolder.syncCursor
      : `/me/mailfolders/${messageFolder.name}/messages/delta?$select=id`;

    const response: PageCollection = await microsoftClient
      .api(apiUrl)
      .version('beta')
      .headers({
        Prefer: `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`,
      })
      .get()
      .catch((error) => {
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
