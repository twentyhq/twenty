import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import {
  CalendarEventImportException,
  CalendarEventImportExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar-event-import.exception';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
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

  public async handleDriverException(
    exception: CalendarEventImportDriverException,
    syncStep: CalendarEventImportSyncStep,
    calendarChannel: Pick<
      CalendarChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    switch (exception.code) {
      case CalendarEventImportDriverExceptionCode.NOT_FOUND:
        await this.handleNotFoundException(
          syncStep,
          calendarChannel,
          workspaceId,
        );
        break;
      case CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR:
        await this.handleTemporaryException(
          syncStep,
          calendarChannel,
          workspaceId,
        );
        break;
      case CalendarEventImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
        await this.handleInsufficientPermissionsException(
          calendarChannel,
          workspaceId,
        );
        break;
      case CalendarEventImportDriverExceptionCode.UNKNOWN:
      case CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
        await this.handleUnknownException(
          exception,
          calendarChannel,
          workspaceId,
        );
        break;
      default:
        throw exception;
    }
  }

  private async handleTemporaryException(
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
        [calendarChannel.id],
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
          [calendarChannel.id],
        );
        break;

      case CalendarEventImportSyncStep.PARTIAL_CALENDAR_EVENT_LIST_FETCH:
        await this.calendarChannelSyncStatusService.schedulePartialCalendarEventListFetch(
          [calendarChannel.id],
        );
        break;

      case CalendarEventImportSyncStep.CALENDAR_EVENTS_IMPORT:
        await this.calendarChannelSyncStatusService.scheduleCalendarEventsImport(
          [calendarChannel.id],
        );
        break;

      default:
        break;
    }
  }

  private async handleInsufficientPermissionsException(
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushCalendarEventsToImport(
      [calendarChannel.id],
      workspaceId,
    );
  }

  private async handleUnknownException(
    exception: CalendarEventImportDriverException,
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedUnknownAndFlushCalendarEventsToImport(
      [calendarChannel.id],
      workspaceId,
    );

    throw new CalendarEventImportException(
      `Unknown error occurred while importing calendar events for calendar channel ${calendarChannel.id} in workspace ${workspaceId}: ${exception.message}`,
      CalendarEventImportExceptionCode.UNKNOWN,
    );
  }

  private async handleNotFoundException(
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
      [calendarChannel.id],
      workspaceId,
    );
  }
}
