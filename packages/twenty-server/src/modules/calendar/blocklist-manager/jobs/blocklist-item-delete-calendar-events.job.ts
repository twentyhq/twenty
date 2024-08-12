import { Logger, Scope } from '@nestjs/common';

import { Any, ILike } from 'typeorm';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

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
    private readonly twentyORMManager: TwentyORMManager,
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

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository('calendarChannel');

    const calendarChannels = await calendarChannelRepository.find({
      where: {
        connectedAccount: {
          accountOwnerId: workspaceMemberId,
        },
      },
    });

    const calendarChannelIds = calendarChannels.map(({ id }) => id);

    const isHandleDomain = handle.startsWith('@');

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository(
        'calendarChannelEventAssociation',
      );

    await calendarChannelEventAssociationRepository.delete({
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
