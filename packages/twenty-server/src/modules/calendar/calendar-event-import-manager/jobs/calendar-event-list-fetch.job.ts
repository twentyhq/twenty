import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';

export type CalendarEventListFetchJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventListFetchJob {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarFetchEventsService: CalendarFetchEventsService,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventListFetchJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannel = await calendarChannelRepository.findOne({
      where: {
        id: calendarChannelId,
        isSyncEnabled: true,
      },
      relations: ['connectedAccount'],
    });

    if (!calendarChannel) {
      return;
    }

    if (
      isThrottled(
        calendarChannel.syncStageStartedAt,
        calendarChannel.throttleFailureCount,
      )
    ) {
      return;
    }

    switch (calendarChannel.syncStage) {
      case CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING:
        await calendarChannelRepository.update(calendarChannelId, {
          syncCursor: '',
          syncStageStartedAt: null,
        });

        await this.calendarFetchEventsService.fetchCalendarEvents(
          calendarChannel,
          calendarChannel.connectedAccount,
          workspaceId,
        );
        break;

      case CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING:
        await this.calendarFetchEventsService.fetchCalendarEvents(
          calendarChannel,
          calendarChannel.connectedAccount,
          workspaceId,
        );
        break;

      default:
        break;
    }
  }
}
