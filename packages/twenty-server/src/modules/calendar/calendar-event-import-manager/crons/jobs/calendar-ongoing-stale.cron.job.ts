import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, IsNull, LessThan, Or, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-import-ongoing-sync-timeout.constant';
import { CALENDAR_ONGOING_STALE_SYNC_STAGES } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-ongoing-stale-sync-stages.constant';
import {
  CalendarOngoingStaleJob,
  type CalendarOngoingStaleJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-ongoing-stale.job';

export const CALENDAR_ONGOING_STALE_CRON_PATTERN = '0 * * * *';

@Processor(MessageQueue.cronQueue)
export class CalendarOngoingStaleCronJob {
  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(CalendarOngoingStaleCronJob.name)
  @SentryCronMonitor(
    CalendarOngoingStaleCronJob.name,
    CALENDAR_ONGOING_STALE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const staleWorkspaceIds = await this.findStaleWorkspaceIds();

    for (const workspaceId of staleWorkspaceIds) {
      try {
        await this.messageQueueService.add<CalendarOngoingStaleJobData>(
          CalendarOngoingStaleJob.name,
          {
            workspaceId,
          },
        );
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: workspaceId,
          },
        });
      }
    }
  }

  private async findStaleWorkspaceIds(): Promise<string[]> {
    const staleBefore = new Date(
      Date.now() - CALENDAR_IMPORT_ONGOING_SYNC_TIMEOUT,
    );
    const staleChannels = await this.calendarChannelRepository.find({
      select: {
        workspaceId: true,
      },
      where: {
        syncStage: In(CALENDAR_ONGOING_STALE_SYNC_STAGES),
        syncStageStartedAt: Or(IsNull(), LessThan(staleBefore)),
        workspace: {
          deletedAt: IsNull(),
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      },
    });

    return [...new Set(staleChannels.map(({ workspaceId }) => workspaceId))];
  }
}
