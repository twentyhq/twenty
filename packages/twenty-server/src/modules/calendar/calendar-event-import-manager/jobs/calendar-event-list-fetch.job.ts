import { Scope } from '@nestjs/common';

import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';

export type CalendarEventsImportJobData = {
  calendarChannelId: string;
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class CalendarEventListFetchJob {
  constructor(
    private readonly calendarEventsImportService: CalendarEventsImportService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectWorkspaceRepository(CalendarChannelWorkspaceEntity)
    private readonly calendarChannelRepository: WorkspaceRepository<CalendarChannelWorkspaceEntity>,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const calendarChannel = await this.calendarChannelRepository.findOne({
      where: {
        id: calendarChannelId,
        isSyncEnabled: true,
      },
    });

    if (!calendarChannel) {
      return;
    }

    if (
      isThrottled(
        calendarChannel.syncStageStartedAt,
        calendarChannel.throttleFailureCount,
      )
    ) {
      return;
    }

    const connectedAccount =
      await this.connectedAccountRepository.getConnectedAccountOrThrow(
        workspaceId,
        calendarChannel.connectedAccountId,
      );

    switch (calendarChannel.syncStage) {
      case CalendarChannelSyncStage.FULL_CALENDAR_EVENT_LIST_FETCH_PENDING:
        await this.calendarChannelRepository.update(calendarChannelId, {
          syncCursor: '',
          syncStageStartedAt: null,
        });

        await this.calendarEventsImportService.processCalendarEventsImport(
          calendarChannel,
          connectedAccount,
          workspaceId,
        );
        break;

      case CalendarChannelSyncStage.PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING:
        await this.calendarEventsImportService.processCalendarEventsImport(
          calendarChannel,
          connectedAccount,
          workspaceId,
        );
        break;

      default:
        break;
    }
  }
}
