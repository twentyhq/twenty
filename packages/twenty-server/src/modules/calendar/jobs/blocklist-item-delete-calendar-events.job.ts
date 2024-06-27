import { Logger, Scope } from '@nestjs/common';

import { Any, ILike } from 'typeorm';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarEventCleanerService } from 'src/modules/calendar/services/calendar-event-cleaner/calendar-event-cleaner.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel.workspace-entity';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export type BlocklistItemDeleteCalendarEventsJobData = {
  workspaceId: string;
  blocklistItemId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class BlocklistItemDeleteCalendarEventsJob {
  private readonly logger = new Logger(
    BlocklistItemDeleteCalendarEventsJob.name,
  );

  constructor(
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    @InjectObjectMetadataRepository(BlocklistWorkspaceEntity)
    private readonly blocklistRepository: BlocklistRepository,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(BlocklistItemDeleteCalendarEventsJob.name)
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

    if (!workspaceMemberId) {
      throw new Error(
        `Workspace member ID is undefined for blocklist item ${blocklistItemId} in workspace ${workspaceId}`,
      );
    }

    const calendarChannels = await this.calendarChannelRepository.find({
      where: {
        connectedAccount: {
          accountOwnerId: workspaceMemberId,
        },
      },
    });

    const calendarChannelIds = calendarChannels.map(({ id }) => id);

    const isHandleDomain = handle.startsWith('@');

    await this.calendarChannelEventAssociationRepository.delete({
      calendarEvent: {
        calendarEventParticipants: {
          handle: isHandleDomain ? ILike(`%${handle}`) : handle,
        },
        calendarChannelEventAssociations: {
          calendarChannelId: Any(calendarChannelIds),
        },
      },
    });

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );

    this.logger.log(
      `Deleted calendar events from handle ${handle} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
    );
  }
}
