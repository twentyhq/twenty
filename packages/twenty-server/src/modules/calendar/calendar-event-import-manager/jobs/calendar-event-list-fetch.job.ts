import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

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
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly calendarFetchEventsService: CalendarFetchEventsService,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventListFetchJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannel = await this.calendarChannelRepository.findOne({
        where: {
          id: calendarChannelId,
          isSyncEnabled: true,
          workspaceId,
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

      await this.calendarFetchEventsService.fetchCalendarEvents(
        calendarChannel as unknown as CalendarChannelEntity,
        calendarChannel.connectedAccount,
        workspaceId,
      );
    }, authContext);
  }
}
