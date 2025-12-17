import { Injectable, Logger } from '@nestjs/common';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  type TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import {
  type CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import {
  CalendarEventImportException,
  CalendarEventImportExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/exceptions/calendar-event-import.exception';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
export enum CalendarEventImportSyncStep {
  CALENDAR_EVENT_LIST_FETCH = 'CALENDAR_EVENT_LIST_FETCH',
  CALENDAR_EVENTS_IMPORT = 'CALENDAR_EVENTS_IMPORT',
}

@Injectable()
export class CalendarEventImportErrorHandlerService {
  private readonly logger = new Logger(
    CalendarEventImportErrorHandlerService.name,
  );
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  public async handleDriverException(
    exception: CalendarEventImportDriverException | TwentyORMException,
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
      case TwentyORMExceptionCode.QUERY_READ_TIMEOUT:
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
      case CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR:
        await this.handleSyncCursorErrorException(calendarChannel, workspaceId);
        break;
      case CalendarEventImportDriverExceptionCode.CHANNEL_MISCONFIGURED:
      case CalendarEventImportDriverExceptionCode.UNKNOWN:
      case CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
      default:
        await this.handleUnknownException(
          exception,
          calendarChannel,
          workspaceId,
        );
        break;
    }
  }

  private async handleSyncCursorErrorException(
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(
      `CalendarChannelId: ${calendarChannel.id} - Sync cursor error, resetting and rescheduling`,
    );

    await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
      [calendarChannel.id],
      workspaceId,
    );
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

      const calendarEventImportException = new CalendarEventImportException(
        `Temporary error occurred ${CALENDAR_THROTTLE_MAX_ATTEMPTS} times while importing calendar events for calendar channel ${calendarChannel.id.slice(0, 5)}... in workspace ${workspaceId} with throttleFailureCount ${calendarChannel.throttleFailureCount}`,
        CalendarEventImportExceptionCode.UNKNOWN,
      );

      this.exceptionHandlerService.captureExceptions(
        [calendarEventImportException],
        {
          additionalData: {
            calendarChannelId: calendarChannel.id,
          },
          workspace: {
            id: workspaceId,
          },
        },
      );

      throw calendarEventImportException;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        await calendarChannelRepository.increment(
          {
            id: calendarChannel.id,
          },
          'throttleFailureCount',
          1,
          undefined,
          ['throttleFailureCount', 'id'],
        );
      },
    );

    switch (syncStep) {
      case CalendarEventImportSyncStep.CALENDAR_EVENT_LIST_FETCH:
        await this.calendarChannelSyncStatusService.markAsCalendarEventListFetchPending(
          [calendarChannel.id],
          workspaceId,
          true,
        );
        break;

      case CalendarEventImportSyncStep.CALENDAR_EVENTS_IMPORT:
        await this.calendarChannelSyncStatusService.markAsCalendarEventsImportPending(
          [calendarChannel.id],
          workspaceId,
          true,
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
    exception: { message: string },
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.calendarChannelSyncStatusService.markAsFailedUnknownAndFlushCalendarEventsToImport(
      [calendarChannel.id],
      workspaceId,
    );

    const calendarEventImportException = new CalendarEventImportException(
      `Unknown error importing calendar events for calendar channel ${calendarChannel.id.slice(0, 5)}... in workspace ${workspaceId}: ${exception.message}`,
      CalendarEventImportExceptionCode.UNKNOWN,
    );

    this.logger.log(exception);
    this.exceptionHandlerService.captureExceptions(
      [calendarEventImportException],
      {
        additionalData: {
          calendarChannelId: calendarChannel.id,
          exception,
        },
        workspace: {
          id: workspaceId,
        },
      },
    );

    throw calendarEventImportException;
  }

  private async handleNotFoundException(
    syncStep: CalendarEventImportSyncStep,
    calendarChannel: Pick<CalendarChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    if (syncStep === CalendarEventImportSyncStep.CALENDAR_EVENT_LIST_FETCH) {
      return;
    }

    await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
      [calendarChannel.id],
      workspaceId,
    );
  }
}
