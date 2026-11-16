import { type Expression } from 'expr-eval-fork';

import { computedFieldExpressionParser } from '@/utils/computed-field/computedFieldExpressionParser';

export const parseComputedFieldExpression = (source: string): Expression =>
  computedFieldExpressionParser.parse(source);
