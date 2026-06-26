import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { z } from 'zod';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getMissingCreateEventScopes } from 'src/modules/calendar/calendar-event-creation-manager/utils/get-missing-create-event-scopes.util';
import { isCalendarCreationSupportedProvider } from 'src/modules/calendar/calendar-event-creation-manager/utils/is-calendar-creation-supported-provider.util';
import { isValidTimeZone } from 'src/modules/calendar/calendar-event-creation-manager/utils/is-valid-time-zone.util';
import { type CalendarEventComposerResult } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-composer-result.type';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type ComposeCalendarEventParams } from 'src/modules/calendar/calendar-event-creation-manager/types/compose-calendar-event-params.type';

// ISO 8601 date-time that carries an explicit UTC offset (Z or ±hh:mm); without it
// the instant is ambiguous and providers would schedule it at the wrong time.
const ISO_DATETIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

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
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  async composeCalendarEvent(
    params: ComposeCalendarEventParams,
    workspaceId: string,
  ): Promise<CalendarEventComposerResult> {
    const normalizedInput = this.normalizeAndValidateInput(params);

    if ('error' in normalizedInput) {
      return { success: false, error: normalizedInput.error };
    }

    const resolution = await this.resolveCalendarAccount(
      params.connectedAccountId,
      workspaceId,
    );

    if ('error' in resolution) {
      return { success: false, error: resolution.error };
    }

    const { connectedAccount, calendarChannel } = resolution;

    const missingScopes = getMissingCreateEventScopes(connectedAccount);

    if (missingScopes.length > 0) {
      return {
        success: false,
        error: `The connected ${connectedAccount.provider} account is missing calendar permissions (${missingScopes.join(', ')}). Please reconnect the account to grant calendar access.`,
      };
    }

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
      if (!ISO_DATE.test(startsAt) || !ISO_DATE.test(endsAt)) {
        return 'startsAt and endsAt must be valid ISO 8601 dates';
      }

      if (endsAt.slice(0, 10) <= startsAt.slice(0, 10)) {
        return 'endsAt must be a later day than startsAt for all-day events';
      }

      return undefined;
    }

    if (
      !ISO_DATETIME_WITH_OFFSET.test(startsAt) ||
      !ISO_DATETIME_WITH_OFFSET.test(endsAt)
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

  private async resolveCalendarAccount(
    connectedAccountId: string | undefined,
    workspaceId: string,
  ): Promise<ResolvedCalendarAccount> {
    // A blank id (the workflow node's default) falls back to the default account.
    if (isNonEmptyString(connectedAccountId)) {
      if (!isValidUuid(connectedAccountId)) {
        return { error: 'The provided connectedAccountId is not a valid UUID' };
      }

      const connectedAccount = await this.connectedAccountRepository.findOne({
        where: { id: connectedAccountId, workspaceId },
      });

      if (!isDefined(connectedAccount)) {
        return {
          error: `No connected account found for id '${connectedAccountId}'`,
        };
      }

      if (!isCalendarCreationSupportedProvider(connectedAccount.provider)) {
        return {
          error: `Calendar event creation is only supported for Google and Microsoft accounts (got ${connectedAccount.provider})`,
        };
      }

      const calendarChannel = await this.findSyncEnabledCalendarChannel(
        connectedAccount.id,
        workspaceId,
      );

      if (!isDefined(calendarChannel)) {
        return {
          error: `Connected account '${connectedAccountId}' has no calendar channel with sync enabled. Enable calendar sync for this account first.`,
        };
      }

      return { connectedAccount, calendarChannel };
    }

    return this.resolveDefaultCalendarAccount(workspaceId);
  }

  // Only sync-enabled channels are eligible: a created event is reconciled by the
  // provider sync, which skips channels whose sync is disabled.
  private async resolveDefaultCalendarAccount(
    workspaceId: string,
  ): Promise<ResolvedCalendarAccount> {
    const calendarChannels = await this.calendarChannelRepository.find({
      where: { workspaceId, isSyncEnabled: true },
      relations: { connectedAccount: true },
      order: { createdAt: 'ASC' },
    });

    const calendarChannel = calendarChannels.find(
      (channel) =>
        isDefined(channel.connectedAccount) &&
        !isDefined(channel.connectedAccount.archivedAt) &&
        isCalendarCreationSupportedProvider(channel.connectedAccount.provider),
    );

    if (!isDefined(calendarChannel)) {
      return {
        error:
          'No Google or Microsoft account with calendar sync is connected in this workspace',
      };
    }

    return {
      connectedAccount: calendarChannel.connectedAccount,
      calendarChannel,
    };
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
