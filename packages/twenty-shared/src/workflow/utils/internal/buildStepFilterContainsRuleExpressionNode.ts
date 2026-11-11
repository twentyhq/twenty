import { isString } from '@sniptt/guards';

import { parseJson } from '@/utils/parseJson';
import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';
import { type RuleExpressionNodeConversion } from '@/workflow/utils/internal/RuleExpressionNodeConversion';
import { ruleExpressionNodeBuilder } from '@/workflow/utils/internal/ruleExpressionNodeBuilder';

// Reproduces the legacy contains(): a JSON list value means any of its items,
// and an empty value is stringified, so "null".includes(value) decides it
export const buildStepFilterContainsRuleExpressionNode = ({
  path,
  value,
  valueKind,
}: {
  path: RuleExpressionNode;
  value: string;
  valueKind: 'text' | 'list';
}): RuleExpressionNodeConversion => {
  const isMatchedByEmptyNull = 'null'.includes(value);
  const isMatchedByEmptyUndefined = 'undefined'.includes(value);

  if (isMatchedByEmptyNull !== isMatchedByEmptyUndefined) {
    return {
      isConvertible: false,
      reason: `the legacy filter matches a missing value against "${value}"`,
    };
  }

  const parsedValue = parseJson<unknown>(value);

  if (Array.isArray(parsedValue) && !parsedValue.every(isString)) {
    return {
      isConvertible: false,
      reason: `the list value "${value}" holds items that are not text`,
    };
  }

  const containsNode = Array.isArray(parsedValue)
    ? ruleExpressionNodeBuilder.or(
        ...parsedValue.map((item) =>
          ruleExpressionNodeBuilder.call(
            'includes',
            path,
            ruleExpressionNodeBuilder.string(item),
          ),
        ),
      )
    : valueKind === 'text' && value === ''
      ? ruleExpressionNodeBuilder.true
      : ruleExpressionNodeBuilder.call(
          'includes',
          path,
          ruleExpressionNodeBuilder.string(value),
        );

  return {
    isConvertible: true,
    node: isMatchedByEmptyNull
      ? ruleExpressionNodeBuilder.or(
          containsNode,
          ruleExpressionNodeBuilder.not(
            ruleExpressionNodeBuilder.call('isDefined', path),
          ),
        )
      : containsNode,
  };
};
