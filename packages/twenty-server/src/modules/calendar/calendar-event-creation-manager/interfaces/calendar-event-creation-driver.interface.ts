import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

export type CalendarEventCreationDriver = {
  createCalendarEvent(
    input: CalendarEventToCreate,
    connectedAccount: Pick<ConnectedAccountEntity, 'id' | 'provider'>,
  ): Promise<FetchedCalendarEvent>;
};
