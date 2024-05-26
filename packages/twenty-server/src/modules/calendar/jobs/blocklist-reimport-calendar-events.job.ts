import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

export type BlocklistReimportCalendarEventsJobData = {
  workspaceId: string;
  workspaceMemberId: string;
  handle: string;
};

@Injectable()
export class BlocklistReimportCalendarEventsJob
  implements MessageQueueJob<BlocklistReimportCalendarEventsJobData>
{
  private readonly logger = new Logger(BlocklistReimportCalendarEventsJob.name);

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService,
  ) {}

  async handle(data: BlocklistReimportCalendarEventsJobData): Promise<void> {
    const { workspaceId, workspaceMemberId, handle } = data;

    this.logger.log(
      `Reimporting calendar events from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
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

    await this.googleCalendarSyncService.startGoogleCalendarSync(
      workspaceId,
      connectedAccount[0].id,
      handle,
    );

    this.logger.log(
      `Reimporting calendar events from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId} done`,
    );
  }
}
