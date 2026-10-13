import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { CALENDAR_EVENT_SHARING_PROVIDERS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-event-sharing-providers.constant';
import { type CalendarEventSharingProvider } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-provider.type';

export const isCalendarEventSharingProvider = (
  provider: ConnectedAccountProvider,
): provider is CalendarEventSharingProvider =>
  CALENDAR_EVENT_SHARING_PROVIDERS.some(
    (sharingProvider) => sharingProvider === provider,
  );
