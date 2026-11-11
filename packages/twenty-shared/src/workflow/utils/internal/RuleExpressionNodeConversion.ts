import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';

export type RuleExpressionNodeConversion =
  | { isConvertible: true; node: RuleExpressionNode }
  | { isConvertible: false; reason: string };
