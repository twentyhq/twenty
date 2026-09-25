import { Scope } from '@nestjs/common';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
  ) {}

  @Process(CalendarRelaunchFailedCalendarChannelJob.name)
  async handle(data: CalendarRelaunchFailedCalendarChannelJobData) {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarChannel = await this.calendarChannelRepository.findOne(
          workspaceId,
          {
            where: {
              id: calendarChannelId,
            },
          },
        );

        if (
          !calendarChannel ||
          calendarChannel.syncStage !== CalendarChannelSyncStage.FAILED ||
          calendarChannel.syncStatus !==
            CalendarChannelSyncStatus.FAILED_UNKNOWN
        ) {
          return;
        }

        await this.calendarChannelRepository.update(
          workspaceId,
          { id: calendarChannelId },
          {
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
            syncStatus: CalendarChannelSyncStatus.ACTIVE,
            throttleFailureCount: 0,
            syncStageStartedAt: null,
          },
        );
      },
      authContext,
      { lite: true },
    );
  }
}
