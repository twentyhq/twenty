import { Logger, Scope } from '@nestjs/common';

import { And, Any, ILike, In, Not, Or } from 'typeorm';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

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
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
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
        select: {
          id: true,
          handle: true,
          connectedAccount: {
            handleAliases: true,
          },
        },
        where: {
          connectedAccount: {
            accountOwnerId: workspaceMemberId,
          },
        },
        relations: ['connectedAccount'],
      });

      for (const calendarChannel of calendarChannels) {
        const calendarChannelHandles = [calendarChannel.handle];

        if (calendarChannel.connectedAccount.handleAliases) {
          calendarChannelHandles.push(
            ...calendarChannel.connectedAccount.handleAliases.split(','),
          );
        }

        const handleConditions = handles.map((handle) => {
          const isHandleDomain = handle.startsWith('@');

          return isHandleDomain
            ? {
                handle: And(
                  Or(ILike(`%${handle}`), ILike(`%.${handle.slice(1)}`)),
                  Not(In(calendarChannelHandles)),
                ),
              }
            : { handle };
        });

        const calendarEventsAssociationsToDelete =
          await calendarChannelEventAssociationRepository.find({
            where: {
              calendarChannelId: calendarChannel.id,
              calendarEvent: {
                calendarEventParticipants: handleConditions,
              },
            },
          });

        if (calendarEventsAssociationsToDelete.length === 0) {
          continue;
        }

        await calendarChannelEventAssociationRepository.delete(
          calendarEventsAssociationsToDelete.map(({ id }) => id),
        );
      }

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
