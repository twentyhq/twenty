import { isNonEmptyString } from '@sniptt/guards';
import { type EvaluationContext } from 'expr-eval-fork';

import { CommandMenuItemVariant } from '@/types/CommandMenuItemVariant';

import { conditionalAvailabilityParser } from './conditionalAvailabilityParser';

const COMMAND_MENU_ITEM_VARIANTS = Object.values(CommandMenuItemVariant);

const isCommandMenuItemVariant = (
  value: unknown,
): value is `${CommandMenuItemVariant}` =>
  COMMAND_MENU_ITEM_VARIANTS.includes(value as CommandMenuItemVariant);

// Anything that does not evaluate to a known variant falls back to the static
// variant, so a broken expression never hides or disables a button by accident.
export const evaluateConditionalVariantExpression = ({
  expression,
  context,
  fallbackVariant,
}: {
  expression: string | null | undefined;
  context: EvaluationContext;
  fallbackVariant: `${CommandMenuItemVariant}`;
}): `${CommandMenuItemVariant}` => {
  if (!isNonEmptyString(expression)) {
    return fallbackVariant;
  }

  try {
    const evaluatedVariant = conditionalAvailabilityParser
      .parse(expression)
      .evaluate(context);

    return isCommandMenuItemVariant(evaluatedVariant)
      ? evaluatedVariant
      : fallbackVariant;
  } catch {
    return fallbackVariant;
  }
};
