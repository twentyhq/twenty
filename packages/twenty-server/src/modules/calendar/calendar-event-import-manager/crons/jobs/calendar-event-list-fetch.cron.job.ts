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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export const CALENDAR_EVENT_LIST_FETCH_CRON_PATTERN = '*/5 * * * *';

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class CalendarEventListFetchCronJob {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
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
        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        const calendarChannels = await this.coreDataSource.query(
          `SELECT * FROM ${schemaName}."calendarChannel" WHERE "isSyncEnabled" = true AND "syncStage" IN ('${CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING}', '${CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING}')`,
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
