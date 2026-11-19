import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/constants/ConditionalAvailabilityFunctions';
import { CONDITIONAL_AVAILABILITY_OPERATORS } from '@/constants/ConditionalAvailabilityOperators';

export const conditionalAvailabilityStrictParser = new Parser({
  allowMemberAccess: true,
  operators: CONDITIONAL_AVAILABILITY_OPERATORS,
});

conditionalAvailabilityStrictParser.consts = { true: true, false: false };

conditionalAvailabilityStrictParser.functions = Object.fromEntries(
  Object.entries(CONDITIONAL_AVAILABILITY_FUNCTIONS).map(
    ([name, { evaluate }]) => [name, evaluate],
  ),
);
