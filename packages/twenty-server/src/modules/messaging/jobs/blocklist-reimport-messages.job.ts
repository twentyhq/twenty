import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { GmailFullSyncService } from 'src/modules/messaging/services/gmail-full-sync/gmail-full-sync.service';

export type BlocklistReimportMessagesJobData = {
  workspaceId: string;
  workspaceMemberId: string;
  handle: string;
};

@Injectable()
export class BlocklistReimportMessagesJob
  implements MessageQueueJob<BlocklistReimportMessagesJobData>
{
  private readonly logger = new Logger(BlocklistReimportMessagesJob.name);

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly gmailFullSyncService: GmailFullSyncService,
  ) {}

  async handle(data: BlocklistReimportMessagesJobData): Promise<void> {
    const { workspaceId, workspaceMemberId, handle } = data;

    this.logger.log(
      `Reimporting messages from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );

    const connectedAccount =
      await this.connectedAccountRepository.getAllByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    if (!connectedAccount || connectedAccount.length === 0) {
      this.logger.error(
        `No connected account found for workspace member ${workspaceMemberId} in workspace ${workspaceId}`,
      );

      return;
    }

    this.gmailFullSyncService.fetchConnectedAccountThreads(
      workspaceId,
      connectedAccount[0].id,
      [handle],
    );

    this.logger.log(
      `Reimporting messages from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId} done`,
    );
  }
}
