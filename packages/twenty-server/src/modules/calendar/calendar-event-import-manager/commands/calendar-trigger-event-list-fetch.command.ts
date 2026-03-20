import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CalendarEventListFetchJob,
  type CalendarEventListFetchJobData,
} from 'src/modules/calendar/calendar-event-import-manager/jobs/calendar-event-list-fetch.job';
import { CalendarChannelSyncStage } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

type CalendarTriggerEventListFetchCommandOptions = {
  workspaceId: string;
  calendarChannelId?: string;
};

@Command({
  name: 'calendar:trigger-event-list-fetch',
  description:
    'Trigger calendar event list fetch immediately without waiting for cron',
})
export class CalendarTriggerEventListFetchCommand extends CommandRunner {
  private readonly logger = new Logger(
    CalendarTriggerEventListFetchCommand.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: CalendarTriggerEventListFetchCommandOptions,
  ): Promise<void> {
    const { workspaceId, calendarChannelId } = options;

    this.logger.log(
      `Triggering calendar event list fetch for workspace ${workspaceId}${calendarChannelId ? ` and channel ${calendarChannelId}` : ' (all pending channels)'}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const calendarChannels = await this.calendarChannelDataAccessService.find(
        workspaceId,
        {
          where: {
            isSyncEnabled: true,
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
            ...(calendarChannelId ? { id: calendarChannelId } : {}),
          },
        },
      );

      if (calendarChannels.length === 0) {
        this.logger.warn(
          'No calendar channels found with CALENDAR_EVENT_LIST_FETCH_PENDING status',
        );

        return;
      }

      this.logger.log(
        `Found ${calendarChannels.length} calendar channel(s) to process`,
      );

      for (const calendarChannel of calendarChannels) {
        await this.calendarChannelDataAccessService.update(
          workspaceId,
          { id: calendarChannel.id },
          {
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_SCHEDULED,
            syncStageStartedAt: new Date().toISOString(),
          },
        );

        await this.messageQueueService.add<CalendarEventListFetchJobData>(
          CalendarEventListFetchJob.name,
          {
            calendarChannelId: calendarChannel.id,
            workspaceId,
          },
        );

        this.logger.log(
          `Triggered fetch for calendar channel ${calendarChannel.id}`,
        );
      }

      this.logger.log(
        `Successfully triggered ${calendarChannels.length} calendar event list fetch job(s)`,
      );
    }, authContext);
  }

  @Option({
    flags: '-w, --workspace-id <workspace_id>',
    description: 'Workspace ID',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-c, --calendar-channel-id [calendar_channel_id]',
    description:
      'Calendar Channel ID (optional - if not provided, triggers for all pending channels)',
    required: false,
  })
  parseCalendarChannelId(value: string): string {
    return value;
  }
}
