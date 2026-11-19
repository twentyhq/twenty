import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';

export const conditionalAvailabilityParser = new Parser();

for (const [name, { evaluate }] of Object.entries(
  CONDITIONAL_AVAILABILITY_FUNCTIONS,
)) {
  conditionalAvailabilityParser.functions[name] = evaluate;
}
