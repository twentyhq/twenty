import { Scope } from '@nestjs/common';

import { Not } from 'typeorm';

import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type BlocklistReimportCalendarEventsJobData = WorkspaceEventBatch<
  ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class BlocklistReimportCalendarEventsJob {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  @Process(BlocklistReimportCalendarEventsJob.name)
  async handle(data: BlocklistReimportCalendarEventsJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    for (const eventPayload of data.events) {
      const workspaceMemberId =
        eventPayload.properties.before.workspaceMemberId;

      const calendarChannels = await calendarChannelRepository.find({
        select: ['id'],
        where: {
          connectedAccount: {
            accountOwnerId: workspaceMemberId,
          },
          syncStage: Not(
            CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
          ),
        },
      });

      await this.calendarChannelSyncStatusService.resetAndScheduleFullCalendarEventListFetch(
        calendarChannels.map((calendarChannel) => calendarChannel.id),
        workspaceId,
      );
    }
  }
}
