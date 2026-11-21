// TODO(@neo773): remove once command menu items use the rule tree
import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_AVAILABILITY_FUNCTIONS } from '@/conditional-availability/constants/ConditionalAvailabilityFunctions';

export const conditionalAvailabilityParser = new Parser();

Object.assign(
  conditionalAvailabilityParser.functions,
  CONDITIONAL_AVAILABILITY_FUNCTIONS,
);
