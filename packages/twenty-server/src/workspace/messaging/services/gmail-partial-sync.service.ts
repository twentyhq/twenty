import { Injectable } from '@nestjs/common';

import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailClientProvider } from 'src/workspace/messaging/providers/gmail/gmail-client.provider';
import { Utils } from 'src/workspace/messaging/services/utils.service';
import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';

@Injectable()
export class GmailPartialSync {
  constructor(
    private readonly gmailClientProvider: GmailClientProvider,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
    private readonly utils: Utils,
    private readonly messagingProducer: MessagingProducer,
  ) {}

  private async getLastSyncHistoryId(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<string> {
    const { connectedAccount } =
      await this.utils.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        connectedAccountId,
      );

    if (!connectedAccount) {
      throw new Error('No connected account found');
    }

    const lastSyncHistoryId = connectedAccount.lastSyncHistoryId;

    if (!lastSyncHistoryId) {
      // Fall back to full sync
      await this.messagingProducer.enqueueFetchAllMessagesFromConnectedAccount(
        { workspaceId, connectedAccountId: connectedAccountId },
        `${workspaceId}-${connectedAccount.id}`,
      );
    }

    return lastSyncHistoryId;
  }
}
