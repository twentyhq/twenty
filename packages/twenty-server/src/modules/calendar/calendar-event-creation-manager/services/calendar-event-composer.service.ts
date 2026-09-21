import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { ConnectedAccountOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';
import { z } from 'zod';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountAccessService } from 'src/engine/metadata-modules/connected-account/connected-account-access.service';
import { ConnectedAccountException } from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { buildUnsupportedOperationMessage } from 'src/engine/metadata-modules/connected-account/utils/build-unsupported-operation-message.util';
import { selectDefaultConnectedAccount } from 'src/engine/metadata-modules/connected-account/utils/select-default-connected-account.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isValidTimeZone } from 'src/modules/calendar/calendar-event-creation-manager/utils/is-valid-time-zone.util';
import { type CalendarEventComposerResult } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-composer-result.type';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type ComposeCalendarEventParams } from 'src/modules/calendar/calendar-event-creation-manager/types/compose-calendar-event-params.type';

// Timed events need an absolute instant, so the date-time must carry an explicit
// UTC offset (Z or ±hh:mm); without one the instant is ambiguous and providers
// would schedule it at the wrong time. All-day boundaries are calendar dates.
const offsetDateTimeSchema = z.string().datetime({ offset: true });
const dateSchema = z.string().date();

type ResolvedCalendarAccount =
  | {
      connectedAccount: ConnectedAccountEntity;
      calendarChannel: CalendarChannelEntity;
    }
  | { error: string };

@Injectable()
export class CalendarEventComposerService {
  private readonly emailSchema = z.string().trim().pipe(z.email());

  constructor(
    private readonly connectedAccountAccessService: ConnectedAccountAccessService,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  async composeCalendarEvent(
    params: ComposeCalendarEventParams,
    authContext: WorkspaceAuthContext,
  ): Promise<CalendarEventComposerResult> {
    const normalizedInput = this.normalizeAndValidateInput(params);

    if ('error' in normalizedInput) {
      return { success: false, error: normalizedInput.error };
    }

    const resolution = await this.resolveCalendarAccountOrError(
      params.connectedAccountId,
      authContext,
    );

    if ('error' in resolution) {
      return { success: false, error: resolution.error };
    }

    const { connectedAccount, calendarChannel } = resolution;

    return {
      success: true,
      data: { input: normalizedInput, connectedAccount, calendarChannel },
    };
  }

  private normalizeAndValidateInput(
    params: ComposeCalendarEventParams,
  ): CalendarEventToCreate | { error: string } {
    const title = params.title?.trim();

    if (!isNonEmptyString(title)) {
      return { error: 'A title is required to create a calendar event' };
    }

    const isFullDay = params.isFullDay ?? false;

    const datesError = this.validateDates(
      params.startsAt,
      params.endsAt,
      isFullDay,
    );

    if (isDefined(datesError)) {
      return { error: datesError };
    }

    const timeZone = params.timeZone ?? 'UTC';

    if (!isValidTimeZone(timeZone)) {
      return { error: `timeZone '${timeZone}' is not a valid IANA time zone` };
    }

    const sendInvitations = params.sendInvitations ?? false;
    // Attendees are only ever attached when the caller explicitly opts in to
    // notifying them, so creating an event never silently emails external people.
    const attendeeEmails = sendInvitations
      ? this.parseAttendeeEmails(params.attendees)
      : [];

    if (attendeeEmails.length > MAX_EMAIL_RECIPIENTS) {
      return {
        error: `Too many attendees: ${attendeeEmails.length}. Maximum allowed is ${MAX_EMAIL_RECIPIENTS}.`,
      };
    }

    const invalidAttendees = attendeeEmails.filter(
      (email) => !this.emailSchema.safeParse(email).success,
    );

    if (invalidAttendees.length > 0) {
      return {
        error: `Invalid attendee email addresses: ${invalidAttendees.join(', ')}`,
      };
    }

    return {
      title,
      description: params.description,
      location: params.location,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      isFullDay,
      timeZone,
      attendees: attendeeEmails.map((email) => ({ email })),
      sendInvitations,
      addConferencing: params.addConferencing ?? false,
    };
  }

  // All-day boundaries collapse to a date, so they must be validated at day
  // granularity; timed boundaries are absolute instants and must carry an offset.
  private validateDates(
    startsAt: string,
    endsAt: string,
    isFullDay: boolean,
  ): string | undefined {
    if (isFullDay) {
      const startDate = startsAt.slice(0, 10);
      const endDate = endsAt.slice(0, 10);

      if (
        !dateSchema.safeParse(startDate).success ||
        !dateSchema.safeParse(endDate).success
      ) {
        return 'startsAt and endsAt must be valid ISO 8601 dates';
      }

      if (endDate <= startDate) {
        return 'endsAt must be a later day than startsAt for all-day events';
      }

      return undefined;
    }

    if (
      !offsetDateTimeSchema.safeParse(startsAt).success ||
      !offsetDateTimeSchema.safeParse(endsAt).success
    ) {
      return 'startsAt and endsAt must be ISO 8601 date-times with an offset (e.g. 2026-07-01T15:00:00Z)';
    }

    if (Date.parse(endsAt) <= Date.parse(startsAt)) {
      return 'endsAt must be after startsAt';
    }

    return undefined;
  }

  private parseAttendeeEmails(attendees: string | undefined): string[] {
    return (attendees ?? '')
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

  private async resolveCalendarAccountOrError(
    connectedAccountId: string | undefined,
    authContext: WorkspaceAuthContext,
  ): Promise<ResolvedCalendarAccount> {
    try {
      return await this.resolveCalendarAccount(connectedAccountId, authContext);
    } catch (error) {
      if (error instanceof ConnectedAccountException) {
        return { error: error.message };
      }

      throw error;
    }
  }

  private async resolveCalendarAccount(
    connectedAccountId: string | undefined,
    authContext: WorkspaceAuthContext,
  ): Promise<ResolvedCalendarAccount> {
    // A blank id (the workflow node's default) falls back to the default account.
    if (!isNonEmptyString(connectedAccountId)) {
      return this.resolveDefaultCalendarAccount(authContext);
    }

    const connectedAccount =
      await this.connectedAccountAccessService.getActableConnectedAccountOrThrow(
        {
          authContext,
          connectedAccountId,
          operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
        },
      );

    const calendarChannel = await this.findSyncEnabledCalendarChannel(
      connectedAccount.id,
      authContext.workspace.id,
    );

    if (!isDefined(calendarChannel)) {
      return {
        error: `Connected account '${connectedAccountId}' has no calendar channel with sync enabled. Enable calendar sync for this account first.`,
      };
    }

    return { connectedAccount, calendarChannel };
  }

  // Only sync-enabled channels are eligible: a created event is reconciled by the
  // provider sync, which skips channels whose sync is disabled.
  private async resolveDefaultCalendarAccount(
    authContext: WorkspaceAuthContext,
  ): Promise<ResolvedCalendarAccount> {
    const actableConnectedAccounts =
      await this.connectedAccountAccessService.listActableConnectedAccounts({
        authContext,
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      });

    const syncEnabledCalendarChannels =
      await this.calendarChannelRepository.find({
        where: {
          workspaceId: authContext.workspace.id,
          isSyncEnabled: true,
          connectedAccountId: In(
            actableConnectedAccounts.map(
              (connectedAccount) => connectedAccount.id,
            ),
          ),
        },
        order: { createdAt: 'ASC' },
      });

    const connectedAccountsWithSyncedChannel = syncEnabledCalendarChannels
      .map((calendarChannel) =>
        actableConnectedAccounts.find(
          (actableAccount) =>
            actableAccount.id === calendarChannel.connectedAccountId,
        ),
      )
      .filter(isDefined);

    const connectedAccount = selectDefaultConnectedAccount({
      authContext,
      connectedAccounts: connectedAccountsWithSyncedChannel,
    });

    const calendarChannel = syncEnabledCalendarChannels.find(
      (channel) => channel.connectedAccountId === connectedAccount?.id,
    );

    if (!isDefined(connectedAccount) || !isDefined(calendarChannel)) {
      return {
        error: await this.buildNoDefaultCalendarAccountError(authContext),
      };
    }

    return { connectedAccount, calendarChannel };
  }

  private async buildNoDefaultCalendarAccountError(
    authContext: WorkspaceAuthContext,
  ): Promise<string> {
    const connectedAccountsMissingScopes =
      await this.connectedAccountAccessService.listConnectedAccountsRequiringReconnect(
        {
          authContext,
          operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
        },
      );

    const connectedAccountMissingScopes = connectedAccountsMissingScopes[0];

    if (isDefined(connectedAccountMissingScopes)) {
      return buildUnsupportedOperationMessage({
        connectedAccount: connectedAccountMissingScopes,
        operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
      });
    }

    return 'No Google, Microsoft or CalDAV account with calendar sync is available to this caller';
  }

  private async findSyncEnabledCalendarChannel(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<CalendarChannelEntity | null> {
    return this.calendarChannelRepository.findOne({
      where: { connectedAccountId, workspaceId, isSyncEnabled: true },
      order: { createdAt: 'ASC' },
    });
  }
}
