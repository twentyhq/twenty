import { Logger, Scope } from '@nestjs/common';

import { Any, ILike } from 'typeorm';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

export type BlocklistItemDeleteCalendarEventsJobData = WorkspaceEventBatch<
  ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
>;

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
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(BlocklistItemDeleteCalendarEventsJob.name)
  async handle(data: BlocklistItemDeleteCalendarEventsJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const blocklistItemIds = data.events.map(
      (eventPayload) => eventPayload.recordId,
    );

    const blocklistRepository =
      await this.twentyORMManager.getRepository<BlocklistWorkspaceEntity>(
        'blocklist',
      );

    const blocklist = await blocklistRepository.find({
      where: {
        id: Any(blocklistItemIds),
      },
    });

    const handlesToDeleteByWorkspaceMemberIdMap = blocklist.reduce(
      (acc, blocklistItem) => {
        const { handle, workspaceMemberId } = blocklistItem;

        if (!acc.has(workspaceMemberId)) {
          acc.set(workspaceMemberId, []);
        }

        acc.get(workspaceMemberId)?.push(handle);

        return acc;
      },
      new Map<string, string[]>(),
    );

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository('calendarChannel');

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository(
        'calendarChannelEventAssociation',
      );

    for (const workspaceMemberId of handlesToDeleteByWorkspaceMemberIdMap.keys()) {
      const handles =
        handlesToDeleteByWorkspaceMemberIdMap.get(workspaceMemberId);

      if (!handles) {
        continue;
      }

      this.logger.log(
        `Deleting calendar events from ${handles.join(
          ', ',
        )} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
      );

      const calendarChannels = await calendarChannelRepository.find({
        where: {
          connectedAccount: {
            accountOwnerId: workspaceMemberId,
          },
        },
      });

      const calendarChannelIds = calendarChannels.map(({ id }) => id);

      const handleConditions = handles
        .map((handle) => {
          const isHandleDomain = handle.startsWith('@');

          return isHandleDomain
            ? [
                { handle: ILike(`%${handle}`) },
                {
                  handle: ILike(`%.${handle.slice(1)}`),
                },
              ]
            : { handle };
        })
        .flat();

      const calendarEventsAssociationsToDelete =
        await calendarChannelEventAssociationRepository.find({
          where: {
            calendarEvent: {
              calendarEventParticipants: handleConditions,
              calendarChannelEventAssociations: {
                calendarChannelId: Any(calendarChannelIds),
              },
            },
          },
        });

      if (calendarEventsAssociationsToDelete.length === 0) {
        return;
      }

      await calendarChannelEventAssociationRepository.delete(
        calendarEventsAssociationsToDelete.map(({ id }) => id),
      );

      this.logger.log(
        `Deleted calendar events from handle ${handles.join(
          ', ',
        )} in workspace ${workspaceId} for workspace member ${workspaceMemberId}`,
      );
    }

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      workspaceId,
    );
  }
}
