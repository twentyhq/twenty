import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';

export type BlocklistItemDeleteCalendarEventsJobData = {
  workspaceId: string;
  blocklistItemId: string;
};

@Injectable()
export class BlocklistItemDeleteCalendarEventsJob
  implements MessageQueueJob<BlocklistItemDeleteCalendarEventsJobData>
{
  private readonly logger = new Logger(
    BlocklistItemDeleteCalendarEventsJob.name,
  );

  constructor(
    @InjectObjectMetadataRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: CalendarChannelRepository,
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationWorkspaceEntity,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  async handle(data: BlocklistItemDeleteCalendarEventsJobData): Promise<void> {
    const { workspaceId, blocklistItemId } = data;

    const blocklistItem = await this.blocklistRepository.getById(
      blocklistItemId,
      workspaceId,
    );

    if (!blocklistItem) {
      this.logger.log(
        `Blocklist item with id ${blocklistItemId} not found in workspace ${workspaceId}`,
      );

      return;
    }

    const { handle, workspaceMemberId } = blocklistItem;

    this.logger.log(
      `Deleting calendar events from ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );

    const calendarChannels =
      await this.calendarChannelRepository.getIdsByWorkspaceMemberId(
        workspaceMemberId,
        workspaceId,
      );

    const calendarChannelIds = calendarChannels.map(({ id }) => id);

    await this.calendarChannelEventAssociationRepository.deleteByCalendarEventParticipantHandleAndCalendarChannelIds(
      handle,
      calendarChannelIds,
      workspaceId,
    );

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );

    this.logger.log(
      `Deleted calendar events from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );
  }
}
