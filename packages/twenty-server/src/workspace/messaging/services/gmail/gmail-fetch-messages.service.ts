import { Injectable, Logger } from '@nestjs/common';

import { FetchMessagesByBatchesService } from 'src/workspace/messaging/services/gmail/fetch-messages-by-batches.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageService } from 'src/workspace/messaging/repositories/message/message.service';
import { createQueriesFromMessageIds } from 'src/workspace/messaging/utils/create-queries-from-message-ids.util';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class GmailFetchMessagesService {
  private readonly logger = new Logger(GmailFetchMessagesService.name);

  constructor(
    private readonly fetchMessagesByBatchesService: FetchMessagesByBatchesService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly connectedAccountService: ConnectedAccountService,
    private readonly messageService: MessageService,
  ) {}

  public async fetchAndSaveMessages(
    messagesToFetch: string[],
    accessToken: string,
    workspaceId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    messageChannelId: string,
    pageNumber?: number,
    lastPageNumber?: number,
  ) {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    const messageQueries = createQueriesFromMessageIds(messagesToFetch);

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    if (errors.length) throw new Error('Error fetching messages');

    const pageNumberOrNumberOfMessages = pageNumber
      ? `page ${pageNumber}${
          lastPageNumber
            ? ` of ${lastPageNumber} (${messagesToSave.length} messages)`
            : ''
        }`
      : `${messagesToSave.length} messages`;

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccount.id}: fetched ${pageNumberOrNumberOfMessages}`,
    );

    await this.messageService.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
      messageChannelId,
      workspaceId,
    );

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccount.id}: saved ${pageNumberOrNumberOfMessages}`,
    );

    const lastModifiedMessageId = messagesToFetch[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) throw new Error('No history id found');

    await this.connectedAccountService.updateLastSyncHistoryIdIfHigher(
      historyId,
      connectedAccount.id,
      workspaceId,
    );

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccount.id}: updated last sync history id`,
    );
  }
}
