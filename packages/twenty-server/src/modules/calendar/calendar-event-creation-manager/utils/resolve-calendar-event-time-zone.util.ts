import { isNonEmptyString } from '@sniptt/guards';

// The workflow node stores an empty string when no time zone is picked
export const resolveCalendarEventTimeZone = (timeZone?: string): string =>
  isNonEmptyString(timeZone) ? timeZone : 'UTC';
