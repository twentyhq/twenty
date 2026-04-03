import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';

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
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  @Process(CalendarEventsImportJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    const { calendarChannelId, workspaceId } = data;

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

      if (!calendarChannel?.isSyncEnabled) {
        return;
      }

      if (
        calendarChannel.syncStage !==
        CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED
      ) {
        return;
      }

      const syncStageStartedAt = calendarChannel.syncStageStartedAt;

      if (
        isThrottled(
          syncStageStartedAt?.toISOString() ?? null,
          calendarChannel.throttleFailureCount,
        )
      ) {
        await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
          [calendarChannel.id],
          workspaceId,
          true,
        );

        return;
      }

      await this.calendarEventsImportService.processCalendarEventsImport(
        calendarChannel as unknown as CalendarChannelEntity,
        calendarChannel.connectedAccount,
        workspaceId,
      );
    }, authContext);
  }
}
