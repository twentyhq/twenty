import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

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
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  @Process(CalendarRelaunchFailedCalendarChannelJob.name)
  async handle(data: CalendarRelaunchFailedCalendarChannelJobData) {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannel = await this.calendarChannelRepository.findOne({
        where: {
          id: calendarChannelId,
          workspaceId,
        },
      });

      if (
        !calendarChannel ||
        calendarChannel.syncStage !== CalendarChannelSyncStage.FAILED ||
        calendarChannel.syncStatus !== CalendarChannelSyncStatus.FAILED_UNKNOWN
      ) {
        return;
      }

      await this.calendarChannelRepository.update(
        { id: calendarChannelId, workspaceId },
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
