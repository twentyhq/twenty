import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CalendarRelaunchFailedCalendarChannelJob,
  type CalendarRelaunchFailedCalendarChannelJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-relaunch-failed-calendar-channel.job';

export const CALENDAR_RELAUNCH_FAILED_CALENDAR_CHANNELS_CRON_PATTERN =
  '*/30 * * * *';

@Processor(MessageQueue.cronQueue)
export class CalendarRelaunchFailedCalendarChannelsCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(CalendarRelaunchFailedCalendarChannelsCronJob.name)
  @SentryCronMonitor(
    CalendarRelaunchFailedCalendarChannelsCronJob.name,
    CALENDAR_RELAUNCH_FAILED_CALENDAR_CHANNELS_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const activeWorkspaceIds = activeWorkspaces.map(
      (workspace) => workspace.id,
    );

    if (activeWorkspaceIds.length === 0) {
      return;
    }

    const failedCalendarChannels = await this.calendarChannelRepository
      .find({
        where: {
          syncStage: CalendarChannelSyncStage.FAILED,
          syncStatus: CalendarChannelSyncStatus.FAILED_UNKNOWN,
          workspaceId: In(activeWorkspaceIds),
        },
      })
      .catch((error) => {
        this.exceptionHandlerService.captureExceptions([error]);

        return [];
      });

    for (const calendarChannel of failedCalendarChannels) {
      try {
        await this.messageQueueService.add<CalendarRelaunchFailedCalendarChannelJobData>(
          CalendarRelaunchFailedCalendarChannelJob.name,
          {
            workspaceId: calendarChannel.workspaceId,
            calendarChannelId: calendarChannel.id,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: calendarChannel.workspaceId,
          },
        });
      }
    }
  }
}
