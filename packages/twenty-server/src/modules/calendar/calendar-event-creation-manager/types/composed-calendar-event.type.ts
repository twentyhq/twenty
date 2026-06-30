import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';

export type ComposedCalendarEvent = {
  input: CalendarEventToCreate;
  connectedAccount: ConnectedAccountEntity;
  calendarChannel: CalendarChannelEntity;
};
