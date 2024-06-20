import { Logger } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export type BlocklistReimportCalendarEventsJobData = {
  workspaceId: string;
  workspaceMemberId: string;
  handle: string;
};

@Processor(MessageQueue.calendarQueue)
export class BlocklistReimportCalendarEventsJob {
  private readonly logger = new Logger(BlocklistReimportCalendarEventsJob.name);

  constructor(
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService,
  ) {}

  @Process(BlocklistReimportCalendarEventsJob.name)
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
