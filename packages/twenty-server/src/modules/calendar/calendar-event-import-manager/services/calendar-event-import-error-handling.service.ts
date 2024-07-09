import { Injectable } from '@nestjs/common';

import { CalendarChannelSyncStatusService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-channel-sync-status.service';
import { CalendarEventError } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-error.type';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class CalendarEventImportErrorHandlerService {
  constructor(
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  public async handleError(
    _error: CalendarEventError,
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedUnknownAndFlushCalendarEventsToImport(
      calendarChannel.id,
      workspaceId,
    );
  }
}
