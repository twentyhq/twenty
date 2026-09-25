import groupBy from 'lodash.groupby';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, IsNull, Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CalendarEventsImportJob,
  type CalendarEventsImportJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-events-import.job';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

export const CALENDAR_EVENTS_IMPORT_CRON_PATTERN = '*/1 * * * *';

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class CalendarEventsImportCronJob {
  private readonly logger = new Logger(CalendarEventsImportCronJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    // Instance-wide cron sweep across every active workspace, so there is no
    // single request workspace to scope by.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(CalendarEventsImportCronJob.name)
  @SentryCronMonitor(
    CalendarEventsImportCronJob.name,
    CALENDAR_EVENTS_IMPORT_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const pendingCalendarChannelsAcrossWorkspaces =
      await this.calendarChannelRepository.find({
        where: {
          isSyncEnabled: true,
          syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
          workspace: {
            activationStatus: WorkspaceActivationStatus.ACTIVE,
            deletedAt: IsNull(),
          },
        },
      });

    const pendingCalendarChannelsByWorkspaceId = groupBy(
      pendingCalendarChannelsAcrossWorkspaces,
      'workspaceId',
    );

    for (const [workspaceId, pendingCalendarChannels] of Object.entries(
      pendingCalendarChannelsByWorkspaceId,
    )) {
      try {
        const calendarChannelsToSchedule = pendingCalendarChannels.filter(
          (calendarChannel) =>
            !isThrottled(
              toIsoStringOrNull(calendarChannel.syncStageStartedAt),
              calendarChannel.throttleFailureCount,
            ),
        );

        const throttledCount =
          pendingCalendarChannels.length - calendarChannelsToSchedule.length;

        if (throttledCount > 0) {
          this.logger.log(
            `Skipped ${throttledCount} throttled calendar channels for workspace ${workspaceId}`,
          );
        }

        if (calendarChannelsToSchedule.length === 0) {
          continue;
        }

        const calendarChannelIds = calendarChannelsToSchedule.map(
          (calendarChannel) => calendarChannel.id,
        );

        const updateResult = await this.calendarChannelRepository
          .createQueryBuilder()
          .update()
          .set({
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_SCHEDULED,
            syncStageStartedAt: new Date(),
          })
          .where({
            id: In(calendarChannelIds),
            workspaceId,
            isSyncEnabled: true,
            syncStage: CalendarChannelSyncStage.CALENDAR_EVENTS_IMPORT_PENDING,
          })
          .returning('id')
          .execute();

        const updatedIds = updateResult.raw.map(
          (row: { id: string }) => row.id,
        );

        for (const calendarChannelId of updatedIds) {
          await this.messageQueueService.add<CalendarEventsImportJobData>(
            CalendarEventsImportJob.name,
            {
              calendarChannelId,
              workspaceId,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }
}
