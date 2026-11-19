import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';

export const conditionalAvailabilityParser = new Parser();

Object.assign(
  conditionalAvailabilityParser.functions,
  CONDITIONAL_AVAILABILITY_FUNCTIONS,
);
