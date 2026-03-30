import { Logger, Scope } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';

export type CalendarChannelDeletionCleanupJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarChannelDeletionCleanupJob {
  private readonly logger = new Logger(CalendarChannelDeletionCleanupJob.name);

  constructor(
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Process(CalendarChannelDeletionCleanupJob.name)
  async handle(data: CalendarChannelDeletionCleanupJobData): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      data.workspaceId,
    );

    if (!isMigrated) {
      return;
    }

    this.logger.debug(
      `WorkspaceId: ${data.workspaceId} Cleaning up calendar channel event associations for channel ${data.calendarChannelId}`,
    );

    await this.calendarEventCleanerService.deleteCalendarChannelEventAssociationsByChannelId(
      {
        workspaceId: data.workspaceId,
        calendarChannelId: data.calendarChannelId,
      },
    );

    await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
      data.workspaceId,
    );
  }
}
