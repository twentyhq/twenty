import { type ConditionalDisplaySelectedRecordsMatch } from 'twenty-shared/types';

export const CONDITIONAL_DISPLAY_SELECTED_RECORDS_MATCHES = {
  EVERY: true,
  SOME: true,
} as const satisfies Record<ConditionalDisplaySelectedRecordsMatch, true>;
