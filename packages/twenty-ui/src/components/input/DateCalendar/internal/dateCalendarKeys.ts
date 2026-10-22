import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const DATE_CALENDAR_KEYS = doNotTranslate({
  PREVIOUS_DAY: 'ArrowLeft',
  NEXT_DAY: 'ArrowRight',
  PREVIOUS_WEEK: 'ArrowUp',
  NEXT_WEEK: 'ArrowDown',
  WEEK_START: 'Home',
  WEEK_END: 'End',
  PREVIOUS_PERIOD: 'PageUp',
  NEXT_PERIOD: 'PageDown',
} as const);
