import { isNonEmptyArray } from '@sniptt/guards';
import { type DAVCalendar } from 'tsdav';

export const isEventCalendar = (
  calendar: Pick<DAVCalendar, 'components'>,
): boolean =>
  !isNonEmptyArray(calendar.components) ||
  calendar.components.includes('VEVENT');
