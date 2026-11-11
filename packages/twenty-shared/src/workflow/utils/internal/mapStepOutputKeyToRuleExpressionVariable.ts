import { isDefined } from '@/utils/validation/isDefined';

type StepOutputKeyRuleExpressionVariableMapping =
  | { isMapped: true; stepId: string; segments: string[] }
  | { isMapped: false; reason: string };

const PLAIN_VARIABLE_PATTERN =
  /^\{\{([A-Za-z0-9_-]+)((?:\.[A-Za-z_][A-Za-z0-9_]*)*)\}\}$/;

// The legacy resolver reads a trailing keyword as a literal, never as a key
const KEYWORD_SEGMENTS = ['true', 'false', 'null', 'undefined'];

// Only plain dotted paths, so appending a segment keeps the resolver's reading
export const mapStepOutputKeyToRuleExpressionVariable = (
  stepOutputKey: string,
): StepOutputKeyRuleExpressionVariableMapping => {
  const match = stepOutputKey.match(PLAIN_VARIABLE_PATTERN);
  const stepId = match?.[1];

  if (!isDefined(match) || !isDefined(stepId)) {
    return {
      isMapped: false,
      reason: `"${stepOutputKey}" is not a plain {{stepId.path}} variable`,
    };
  }

  const segments = (match[2] ?? '').split('.').filter(Boolean);

  if (segments.some((segment) => KEYWORD_SEGMENTS.includes(segment))) {
    return {
      isMapped: false,
      reason: `"${stepOutputKey}" reads a key named like a literal`,
    };
  }

  return { isMapped: true, stepId, segments };
};
