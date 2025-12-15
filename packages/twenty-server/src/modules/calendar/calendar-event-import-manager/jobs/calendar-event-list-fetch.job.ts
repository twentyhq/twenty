import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import {
  CalendarChannelSyncStage,
  type CalendarChannelWorkspaceEntity,
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly calendarFetchEventsService: CalendarFetchEventsService,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventListFetchJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
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
          calendarChannel.syncStage !==
          CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED
        ) {
          return;
        }

        if (
          isThrottled(
            calendarChannel.syncStageStartedAt,
            calendarChannel.throttleFailureCount,
          )
        ) {
          await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchPending(
            [calendarChannel.id],
            workspaceId,
            true,
          );

          return;
        }

        await this.calendarFetchEventsService.fetchCalendarEvents(
          calendarChannel,
          calendarChannel.connectedAccount,
          workspaceId,
        );
      },
    );
  }
}
