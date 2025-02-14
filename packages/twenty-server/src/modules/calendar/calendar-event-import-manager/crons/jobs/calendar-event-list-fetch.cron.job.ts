import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared';
import { Any, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  CalendarEventListFetchJob,
  CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export const CALENDAR_EVENT_LIST_FETCH_CRON_PATTERN = '*/5 * * * *';

@Processor({
  queueName: MessageQueue.cronQueue,
})
export class CalendarEventListFetchCronJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
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
        const calendarChannelRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            activeWorkspace.id,
            'calendarChannel',
          );

        const calendarChannels = await calendarChannelRepository.find({
          where: {
            isSyncEnabled: true,
            syncStage: Any([
              CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING,
              CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING,
            ]),
          },
        });

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
