import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getMissingCreateEventScopes } from 'src/modules/calendar/calendar-event-creation-manager/utils/get-missing-create-event-scopes.util';
import { isCalendarCreationSupportedProvider } from 'src/modules/calendar/calendar-event-creation-manager/utils/is-calendar-creation-supported-provider.util';

// Mirrors CalendarEventComposerService: created events are reconciled by the provider sync, which skips channels whose sync is disabled
export const canConnectedAccountCreateCalendarEvents = (
  connectedAccount: Pick<ConnectedAccountEntity, 'provider' | 'scopes'> & {
    calendarChannels: Pick<CalendarChannelEntity, 'isSyncEnabled'>[];
  },
): boolean =>
  isCalendarCreationSupportedProvider(connectedAccount.provider) &&
  getMissingCreateEventScopes(connectedAccount).length === 0 &&
  connectedAccount.calendarChannels.some(
    (calendarChannel) => calendarChannel.isSyncEnabled,
  );
