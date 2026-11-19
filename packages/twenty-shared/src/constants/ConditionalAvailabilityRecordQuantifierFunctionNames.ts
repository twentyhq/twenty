import { type ConditionalAvailabilityRecordQuantifier } from '@/types/ConditionalAvailabilityRecordQuantifier';

export const CONDITIONAL_AVAILABILITY_RECORD_QUANTIFIER_FUNCTION_NAMES = {
  EVERY: 'everyMatches',
  SOME: 'someMatches',
  NONE: 'noneMatches',
} as const satisfies Record<ConditionalAvailabilityRecordQuantifier, string>;
