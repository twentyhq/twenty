import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';

export type CalendarEventsImportJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventsImportJob {
  constructor(
    private readonly calendarEventsImportService: CalendarEventsImportService,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  @Process(CalendarEventsImportJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    const { calendarChannelId, workspaceId } = data;

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

    if (!calendarChannel?.isSyncEnabled) {
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

    if (
      calendarChannel.syncStage !==
      CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING
    ) {
      return;
    }

    await this.calendarEventsImportService.processCalendarEventsImport(
      calendarChannel,
      calendarChannel.connectedAccount,
      workspaceId,
    );
  }
}
