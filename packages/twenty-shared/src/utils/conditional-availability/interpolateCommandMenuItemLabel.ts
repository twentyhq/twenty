import { type EvaluationContext } from 'expr-eval-fork';

import { isDefined } from '../validation/isDefined';

import { type Nullable } from '@/types';
import { conditionalAvailabilityParser } from './conditionalAvailabilityParser';

const TEMPLATE_VARIABLE_REGEX = /\$\{([^}]+)\}/g;

export const interpolateCommandMenuItemLabel = ({
  label,
  context,
}: {
  label: Nullable<string>;
  context: EvaluationContext;
}): Nullable<string> => {
  if (!isDefined(label)) {
    return null;
  }

  if (!TEMPLATE_VARIABLE_REGEX.test(label)) {
    return label;
  }

  TEMPLATE_VARIABLE_REGEX.lastIndex = 0;

  return label.replace(TEMPLATE_VARIABLE_REGEX, (match, expression: string) => {
    try {
      const parsed = conditionalAvailabilityParser.parse(expression.trim());
      const result = parsed.evaluate(context);

      return isDefined(result) ? String(result) : '';
    } catch {
      return match;
    }
  });
};
