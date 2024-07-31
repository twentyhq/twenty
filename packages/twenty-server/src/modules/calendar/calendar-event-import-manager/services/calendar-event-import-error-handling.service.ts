import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-channel-sync-status.service';
import { CalendarEventError } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-error.type';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

export enum CalendarEventImportSyncStep {
  FULL_CALENDAR_EVENT_LIST_FETCH = 'FULL_CALENDAR_EVENT_LIST_FETCH',
  PARTIAL_CALENDAR_EVENT_LIST_FETCH = 'PARTIAL_CALENDAR_EVENT_LIST_FETCH',
  CALENDAR_EVENTS_IMPORT = 'CALENDAR_EVENTS_IMPORT',
}

@Injectable()
export class CalendarEventImportErrorHandlerService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  public async handleError(
    error: CalendarEventError,
    syncStep: CalendarEventImportSyncStep,
    calendarChannel: Pick<
      CalendarChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    switch (error.code) {
      case 'NOT_FOUND':
        await this.handleNotFoundError(syncStep, calendarChannel, workspaceId);
        break;
      case 'TEMPORARY_ERROR':
        await this.handleTemporaryError(syncStep, calendarChannel, workspaceId);
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        await this.handleInsufficientPermissionsError(
          calendarChannel,
          workspaceId,
        );
        break;
      case 'UNKNOWN':
        await this.handleUnknownError(error, calendarChannel, workspaceId);
        break;
    }
  }

  private async handleTemporaryError(
    syncStep: CalendarEventImportSyncStep,
    calendarChannel: Pick<
      CalendarChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    if (
      calendarChannel.throttleFailureCount >= CALENDAR_THROTTLE_MAX_ATTEMPTS
    ) {
      await this.calendarChannelSyncStatusService.markAsFailedUnknownAndFlushCalendarEventsToImport(
        calendarChannel.id,
        workspaceId,
      );

      return;
    }

    const calendarChannelRepository =
      await this.twentyORMManager.getRepository<CalendarChannelWorkspaceEntity>(
        'calendarChannel',
      );

    await calendarChannelRepository.increment(
      {
        id: calendarChannel.id,
      },
      'throttleFailureCount',
      1,
    );

    switch (syncStep) {
      case CalendarEventImportSyncStep.FULL_CALENDAR_EVENT_LIST_FETCH:
        await this.calendarChannelSyncStatusService.scheduleFullCalendarEventListFetch(
          calendarChannel.id,
        );
        break;

      case CalendarEventImportSyncStep.PARTIAL_CALENDAR_EVENT_LIST_FETCH:
        await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
          calendarChannel.id,
        );
        break;

      case CalendarEventImportSyncStep.CALENDAR_EVENTS_IMPORT:
        await this.calendarChannelSyncStatusService.scheduleCalendarEventsImport(
          calendarChannel.id,
        );
        break;

      default:
        break;
    }
  }

  private async handleInsufficientPermissionsError(
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
      calendarChannel.id,
      workspaceId,
    );
  }

  private async handleUnknownError(
    error: CalendarEventError,
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedUnknownAndFlushCalendarEventsToImport(
      calendarChannel.id,
      workspaceId,
    );

    throw new Error(
      `Unknown error occurred while importing calendar events for calendar channel ${calendarChannel.id} in workspace ${workspaceId}: ${error.message}`,
    );
  }

  private async handleNotFoundError(
    syncStep: CalendarEventImportSyncStep,
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    if (
      syncStep === CalendarEventImportSyncStep.FULL_CALENDAR_EVENT_LIST_FETCH
    ) {
      return;
    }

    await this.calendarChannelSyncStatusService.resetAndScheduleFullCalendarEventListFetch(
      calendarChannel.id,
      workspaceId,
    );
  }
}
