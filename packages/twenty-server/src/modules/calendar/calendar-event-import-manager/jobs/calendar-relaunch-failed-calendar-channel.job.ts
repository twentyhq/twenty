import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelWorkspaceEntity,
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
  ) {}

  @Process(CalendarRelaunchFailedCalendarChannelJob.name)
  async handle(data: CalendarRelaunchFailedCalendarChannelJobData) {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
            { shouldBypassPermissionChecks: true },
          );

        const calendarChannel = await calendarChannelRepository.findOne({
          where: {
            id: calendarChannelId,
          },
          relations: {
            connectedAccount: {
              accountOwner: true,
            },
          },
        });

        if (
          !calendarChannel ||
          calendarChannel.syncStage !== CalendarChannelSyncStage.FAILED ||
          calendarChannel.syncStatus !==
            CalendarChannelSyncStatus.FAILED_UNKNOWN
        ) {
          return;
        }

        await calendarChannelRepository.update(calendarChannelId, {
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
          syncStatus: CalendarChannelSyncStatus.ACTIVE,
        });
      },
    );
  }
}
