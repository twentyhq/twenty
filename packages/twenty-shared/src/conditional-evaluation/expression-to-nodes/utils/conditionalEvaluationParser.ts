// TODO(@neo773): remove once command menu items use the rule tree
import { Parser } from 'expr-eval-fork';

import { CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';

export const conditionalEvaluationParser = new Parser();

Object.assign(
  conditionalEvaluationParser.functions,
  CONDITIONAL_EVALUATION_FUNCTIONS,
);
