import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { isSyncStale } from 'src/modules/calendar/calendar-event-import-manager/utils/is-sync-stale.util';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';

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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  @Process(CalendarOngoingStaleJob.name)
  async handle(data: CalendarOngoingStaleJobData): Promise<void> {
    const { workspaceId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannels = await this.calendarChannelRepository.find({
        where: {
          syncStage: In([
            CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING,
            CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING,
            CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
            CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
          ]),
          workspaceId,
        },
      });

      for (const calendarChannel of calendarChannels) {
        const syncStageStartedAt = calendarChannel.syncStageStartedAt;

        if (isSyncStale(syncStageStartedAt?.toISOString() ?? null)) {
          await this.calendarChannelSyncStatusService.resetSyncStageStartedAt(
            [calendarChannel.id],
            workspaceId,
          );

          switch (calendarChannel.syncStage) {
            case CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_ONGOING:
            case CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED:
              this.logger.log(
                `Sync for calendar channel ${calendarChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to CALENDAR_EVENT_LIST_FETCH_PENDING`,
              );
              await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchPending(
                [calendarChannel.id],
                workspaceId,
              );
              break;
            case CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_ONGOING:
            case CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED:
              this.logger.log(
                `Sync for calendar channel ${calendarChannel.id} and workspace ${workspaceId} is stale. Setting sync stage to CALENDAR_EVENTS_IMPORT_PENDING`,
              );
              await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
                [calendarChannel.id],
                workspaceId,
              );
              break;
            default:
              break;
          }
        }
      }
    }, authContext);
  }
}
