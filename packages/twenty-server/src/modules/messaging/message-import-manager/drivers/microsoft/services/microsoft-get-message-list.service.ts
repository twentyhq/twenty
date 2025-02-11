import { Injectable } from '@nestjs/common';

import {
  PageCollection,
  PageIterator,
  PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { v4 } from 'uuid';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';
import { MicrosoftHandleErrorService } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-handle-error.service';
import { MessageFolderName } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/folders';
import {
  GetFullMessageListForFoldersResponse,
  GetFullMessageListResponse,
  GetPartialMessageListForFoldersResponse,
  GetPartialMessageListResponse,
} from 'src/modules/messaging/message-import-manager/services/messaging-get-message-list.service';
// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;

@Injectable()
export class MicrosoftGetMessageListService {
  constructor(
    private readonly microsoftClientProvider: MicrosoftClientProvider,
    private readonly microsoftHandleErrorService: MicrosoftHandleErrorService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async getFullMessageListForFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
    folders: Pick<MessageFolderWorkspaceEntity, 'id' | 'name'>[],
  ): Promise<GetFullMessageListForFoldersResponse[]> {
    const result: GetFullMessageListForFoldersResponse[] = [];

    for (const folder of folders) {
      const response = await this.getFullMessageList(
        connectedAccount,
        folder.name as MessageFolderName,
      );

      result.push({
        ...response,
        folderId: folder.id,
      });
    }

    return result;
  }

  public async getFullMessageList(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'refreshToken' | 'id'
    >,
    folderName: MessageFolderName,
  ): Promise<GetFullMessageListResponse> {
    const messageExternalIds: string[] = [];

    const microsoftClient =
      await this.microsoftClientProvider.getMicrosoftClient(connectedAccount);

    const response: PageCollection = await microsoftClient
      .api(`/me/mailfolders/${folderName}/messages/delta?$select=id`)
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

  public async getPartialMessageListForFolders(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'refreshToken' | 'id'
    >,
    messageChannel: MessageChannelWorkspaceEntity,
  ): Promise<GetPartialMessageListForFoldersResponse[]> {
    const result: GetPartialMessageListForFoldersResponse[] = [];

    if (messageChannel.messageFolders.length === 0) {
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

      const response = await this.getPartialMessageList(
        connectedAccount,
        messageChannel.syncCursor,
      );

      result.push({
        ...response,
        folderId: newFolder.id,
      });

      // we are ok with not synchronizing the legacy connected microsoft accounts.
      // so we return an empty array.
      return result;
    }

    for (const folder of messageChannel.messageFolders) {
      const response = await this.getPartialMessageList(
        connectedAccount,
        folder.syncCursor,
      );

      result.push({
        ...response,
        folderId: folder.id,
      });
    }

    return result;
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
      previousSyncCursor: syncCursor,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
    };
  }
}
