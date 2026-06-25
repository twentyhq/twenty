import { Injectable, Logger } from '@nestjs/common';

import {
  type BatchRequestData,
  type Client,
  PageIterator,
  type PageCollection,
  type PageIteratorCallback,
} from '@microsoft/microsoft-graph-client';
import { isNonEmptyString } from '@sniptt/guards';

import { MessageFolderImportPolicy } from 'twenty-shared/types';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MicrosoftMessageListFetchErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/microsoft/services/microsoft-message-list-fetch-error-handler.service';
import { type MicrosoftGraphBatchResponse } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/microsoft-graph-batch-response.type';
import { type MicrosoftGraphDeltaListResponseBody } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/microsoft-graph-delta-list-response-body.type';
import { toRelativeGraphUrl } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/to-relative-graph-url.util';
import { type GetMessageListsArgs } from 'src/modules/messaging/message-import-manager/types/get-message-lists-args.type';
import {
  type GetMessageListsResponse,
  type GetOneMessageListResponse,
} from 'src/modules/messaging/message-import-manager/types/get-message-lists-response.type';
import { isDefined } from 'twenty-shared/utils';

// Microsoft API limit is 999 messages per request on this endpoint
const MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT = 999;
const MESSAGE_LIST_PREFER_HEADER = `odata.maxpagesize=${MESSAGING_MICROSOFT_USERS_MESSAGES_LIST_MAX_RESULT}, IdType="ImmutableId"`;
const MICROSOFT_GRAPH_BATCH_LIMIT = 20;

type FolderToProcess = Pick<
  MessageFolderEntity,
  'id' | 'name' | 'syncCursor' | 'externalId'
>;

@Injectable()
export class MicrosoftGetMessageListService {
  private readonly logger = new Logger(MicrosoftGetMessageListService.name);
  constructor(
    private readonly microsoftOAuth2ClientProvider: MicrosoftOAuth2ClientProvider,
    private readonly microsoftMessageListFetchErrorHandler: MicrosoftMessageListFetchErrorHandler,
  ) {}

  public async getMessageLists({
    messageChannel,
    connectedAccount,
    messageFolders,
  }: GetMessageListsArgs): Promise<GetMessageListsResponse> {
    const foldersToProcess =
      messageChannel.messageFolderImportPolicy ===
      MessageFolderImportPolicy.SELECTED_FOLDERS
        ? messageFolders.filter((folder) => folder.isSynced)
        : messageFolders;

    if (foldersToProcess.length === 0) {
      this.logger.warn(
        `Connected account ${connectedAccount.id}: Message Channel: ${messageChannel.id}: No folders to process`,
      );

      return [];
    }

    const microsoftClient = await this.microsoftOAuth2ClientProvider.getClient(
      connectedAccount.id,
    );

    const results: GetMessageListsResponse = [];

    for (
      let batchStart = 0;
      batchStart < foldersToProcess.length;
      batchStart += MICROSOFT_GRAPH_BATCH_LIMIT
    ) {
      const foldersBatch = foldersToProcess.slice(
        batchStart,
        batchStart + MICROSOFT_GRAPH_BATCH_LIMIT,
      );

      const batchResults = await this.getMessageListBatch(
        microsoftClient,
        foldersBatch,
      );

      results.push(...batchResults);
    }

    return results;
  }

  private async getMessageListBatch(
    microsoftClient: Client,
    foldersBatch: FolderToProcess[],
  ): Promise<GetOneMessageListResponse[]> {
    const folderByRequestId = new Map<string, FolderToProcess>();

    const requests: BatchRequestData[] = foldersBatch.map((folder, index) => {
      const requestId = (index + 1).toString();

      folderByRequestId.set(requestId, folder);

      return {
        id: requestId,
        method: 'GET',
        url: this.buildInitialDeltaUrl(folder),
        headers: { Prefer: MESSAGE_LIST_PREFER_HEADER },
      };
    });

    const batchResponse: MicrosoftGraphBatchResponse<MicrosoftGraphDeltaListResponseBody> =
      await microsoftClient
        .api('/$batch')
        .version('beta')
        .post({ requests })
        .catch((error: unknown) =>
          this.microsoftMessageListFetchErrorHandler.handleError(error),
        );

    const results: GetOneMessageListResponse[] = [];

    for (const response of batchResponse.responses) {
      const folder = folderByRequestId.get(response.id);

      if (!isDefined(folder)) {
        throw new Error(
          `Microsoft batch response references unknown request id ${response.id}`,
        );
      }

      if (response.status !== 200) {
        this.microsoftMessageListFetchErrorHandler.handleError({
          statusCode: response.status,
          message: response.body?.error?.message,
          code: response.body?.error?.code,
        });
      }

      results.push(
        await this.iterateFolderPages(microsoftClient, folder, response.body),
      );
    }

    return results;
  }

  private buildInitialDeltaUrl(folder: FolderToProcess): string {
    if (isNonEmptyString(folder.syncCursor)) {
      return toRelativeGraphUrl(folder.syncCursor);
    }

    const folderId = folder.externalId || folder.name;

    return `/me/mailfolders/${folderId}/messages/delta?$select=id`;
  }

  private async iterateFolderPages(
    microsoftClient: Client,
    folder: FolderToProcess,
    firstPage?: MicrosoftGraphDeltaListResponseBody,
  ): Promise<GetOneMessageListResponse> {
    const messageExternalIds: string[] = [];
    const messageExternalIdsToDelete: string[] = [];

    const callback: PageIteratorCallback = (data: { id: string }) => {
      if ('@removed' in data) {
        messageExternalIdsToDelete.push(data.id);
      } else {
        messageExternalIds.push(data.id);
      }

      return true;
    };

    const pageCollection: PageCollection = {
      value: firstPage?.value ?? [],
      '@odata.nextLink': firstPage?.['@odata.nextLink'],
      '@odata.deltaLink': firstPage?.['@odata.deltaLink'],
    };

    const pageIterator = new PageIterator(
      microsoftClient,
      pageCollection,
      callback,
      { headers: { Prefer: MESSAGE_LIST_PREFER_HEADER } },
    );

    await pageIterator.iterate().catch((error: unknown) => {
      this.microsoftMessageListFetchErrorHandler.handleError(error);
    });

    return {
      messageExternalIds,
      messageExternalIdsToDelete,
      previousSyncCursor: folder.syncCursor,
      nextSyncCursor: pageIterator.getDeltaLink() || '',
      folderId: folder.id,
    };
  }
}
