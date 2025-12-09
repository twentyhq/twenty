import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CalendarRelaunchFailedCalendarChannelJob,
  type CalendarRelaunchFailedCalendarChannelJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-relaunch-failed-calendar-channel.job';
import {
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export const CALENDAR_RELAUNCH_FAILED_CALENDAR_CHANNELS_CRON_PATTERN =
  '*/30 * * * *';

@Processor(MessageQueue.cronQueue)
export class CalendarRelaunchFailedCalendarChannelsCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const failedCalendarChannels = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."calendarChannel" WHERE "syncStage" = '${CalendarChannelSyncStage.FAILED}' AND "syncStatus" = '${CalendarChannelSyncStatus.FAILED_UNKNOWN}'`,
        );

        for (const calendarChannel of failedCalendarChannels) {
          await this.messageQueueService.add<CalendarRelaunchFailedCalendarChannelJobData>(
            CalendarRelaunchFailedCalendarChannelJob.name,
            {
              workspaceId: activeWorkspace.id,
              calendarChannelId: calendarChannel.id,
            },
          );
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}
