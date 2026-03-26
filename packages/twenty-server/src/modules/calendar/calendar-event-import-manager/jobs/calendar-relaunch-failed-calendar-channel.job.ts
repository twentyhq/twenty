import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export type CalendarRelaunchFailedCalendarChannelJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarRelaunchFailedCalendarChannelJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
  ) {}

  @Process(CalendarRelaunchFailedCalendarChannelJob.name)
  async handle(data: CalendarRelaunchFailedCalendarChannelJobData) {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannel =
        await this.calendarChannelDataAccessService.findOne(workspaceId, {
          where: {
            id: calendarChannelId,
          },
        });

      if (
        !calendarChannel ||
        calendarChannel.syncStage !== CalendarChannelSyncStage.FAILED ||
        calendarChannel.syncStatus !== CalendarChannelSyncStatus.FAILED_UNKNOWN
      ) {
        return;
      }

      await this.calendarChannelDataAccessService.update(
        workspaceId,
        { id: calendarChannelId },
        {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
          throttleFailureCount: 0,
          syncStageStartedAt: null,
        },
      );
    }, authContext);
  }
}
