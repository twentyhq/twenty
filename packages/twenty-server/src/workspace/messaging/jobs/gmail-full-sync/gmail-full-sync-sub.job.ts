import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { GmailFetchMessagesService } from 'src/workspace/messaging/services/gmail/gmail-fetch-messages.service';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

export type GmailFullSyncSubJobData = {
  pageNumber: number;
  lastPageNumber: number;
  messagesToFetch: string[];
  accessToken: string;
  workspaceId: string;
  connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>;
  messageChannelId: string;
};

@Injectable()
export class GmailFullSyncSubJob
  implements MessageQueueJob<GmailFullSyncSubJobData>
{
  private readonly logger = new Logger(GmailFullSyncSubJob.name);

  constructor(
    private readonly gmailFetchMessagesService: GmailFetchMessagesService,
  ) {}

  async handle(data: GmailFullSyncSubJobData): Promise<void> {
    this.logger.log(
      `gmail full-sync for workspace ${data.workspaceId} and account ${data.connectedAccount.id} and page ${data.pageNumber} of ${data.lastPageNumber}`,
    );

    await this.gmailFetchMessagesService.fetchAndSaveMessages(
      data.messagesToFetch,
      data.accessToken,
      data.workspaceId,
      data.connectedAccount,
      data.messageChannelId,
      data.pageNumber,
      data.lastPageNumber,
    );
  }
}
