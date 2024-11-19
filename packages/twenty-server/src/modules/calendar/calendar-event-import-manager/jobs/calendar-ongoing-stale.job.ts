import { Logger, Scope } from '@nestjs/common';

import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { isSyncStale } from 'src/modules/calendar/calendar-event-import-manager/utils/is-sync-stale.util';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type CalendarOngoingStaleJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarOngoingStaleJob {
  private readonly logger = new Logger(CalendarOngoingStaleJob.name);
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  @Process(CalendarOngoingStaleJob.name)
  async handle(data: CalendarOngoingStaleJobData): Promise<void> {
    const { workspaceId } = data;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannels = await calendarChannelRepository.find({
      where: {
        syncStage: In([
          CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
          CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
        ]),
      },
    });

    for (const calendarChannel of calendarChannels) {
      if (
        calendarChannel.syncStageStartedAt &&
        isSyncStale(calendarChannel.syncStageStartedAt)
      ) {
        this.logger.log(
          `Sync for calendar channel ${calendarChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to pending`,
        );
        await this.calendarChannelSyncStatusService.resetSyncStageStartedAt([
          calendarChannel.id,
        ]);

        switch (calendarChannel.syncStage) {
          case CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING:
            await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
              [calendarChannel.id],
            );
            break;
          case CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING:
            await this.calendarChannelSyncStatusService.scheduleCalendarEventsImport(
              [calendarChannel.id],
            );
            break;
          default:
            break;
        }
      }
    }
  }
}
