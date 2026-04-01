import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';

export const CALENDAR_EVENT_LIST_FETCH_CRON_PATTERN = '*/5 * * * *';

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class CalendarEventListFetchCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  @Process(CalendarEventListFetchCronJob.name)
  @SentryCronMonitor(
    CalendarEventListFetchCronJob.name,
    CALENDAR_EVENT_LIST_FETCH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const now = new Date().toISOString();

        const [calendarChannels] = await this.coreDataSource.query(
          `UPDATE core."calendarChannel" SET "syncStage" = '${CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED}', "syncStageStartedAt" = COALESCE("syncStageStartedAt", '${now}')
           WHERE "workspaceId" = '${activeWorkspace.id}' AND "isSyncEnabled" = true AND "syncStage" = '${CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING}' RETURNING *`,
        );

        for (const calendarChannel of calendarChannels) {
          await this.messageQueueService.add<CalendarEventListFetchJobData>(
            CalendarEventListFetchJob.name,
            {
              calendarChannelId: calendarChannel.id,
              workspaceId: activeWorkspace.id,
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
