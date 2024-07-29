import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventsImportService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-events-import.service';
import {
  CalendarChannelSyncStage,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';

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
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarEventsImportService: CalendarEventsImportService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  @Process(CalendarEventListFetchJob.name)
  async handle(data: CalendarEventsImportJobData): Promise<void> {
    const { workspaceId, calendarChannelId } = data;

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    const calendarChannel = await calendarChannelRepository.findOne({
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
        await calendarChannelRepository.update(calendarChannelId, {
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
