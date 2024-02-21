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
    const t_0 = Date.now();

    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    const messageQueries = createQueriesFromMessageIds(messagesToFetch);

    const page =
      pageNumber &&
      `page ${pageNumber}${lastPageNumber ? ` of ${lastPageNumber}` : ''}`;

    const pageNumberOrNumberOfMessages = page
      ? `${page} (${messageQueries.length} messages)`
      : `${messageQueries.length} messages`;

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccount.id}: fetching ${pageNumberOrNumberOfMessages}`,
    );

    let t_1 = Date.now();

    const { messages: messagesToSave, errors } =
      await this.fetchMessagesByBatchesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    let t_2 = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${
        connectedAccount.id
      }: fetched ${pageNumberOrNumberOfMessages} in ${t_2 - t_1}ms`,
    );

    if (errors.length) throw new Error('Error fetching messages');

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${connectedAccount.id}: saving ${pageNumberOrNumberOfMessages}`,
    );

    t_1 = Date.now();

    await this.messageService.saveMessages(
      messagesToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount,
      messageChannelId,
      workspaceId,
    );

    t_2 = Date.now();

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${
        connectedAccount.id
      }: saved ${pageNumberOrNumberOfMessages} in ${t_2 - t_1}ms`,
    );

    const lastModifiedMessageId = messagesToFetch[0];

    const historyId = messagesToSave.find(
      (message) => message.externalId === lastModifiedMessageId,
    )?.historyId;

    if (!historyId) throw new Error('No history id found');

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${
        connectedAccount.id
      }: updating lastSyncHistoryId if higher${page ? ` for ${page}` : ''}`,
    );

    await this.connectedAccountService.updateLastSyncHistoryIdIfHigher(
      historyId,
      connectedAccount.id,
      workspaceId,
    );

    this.logger.log(
      `gmail full-sync for workspace ${workspaceId} and account ${
        connectedAccount.id
      }: done${page ? ` for ${page}` : ''} in ${Date.now() - t_0}ms`,
    );
  }
}
