import { isObject, isString } from '@sniptt/guards';

import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/constants/CaptureAllVariableTagInnerRegex';

function* resolveVariables(value: unknown): Generator<string> {
  if (isString(value)) {
    for (const [, variablePath] of value.matchAll(
      CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    )) {
      yield variablePath;
    }

    return;
  }

  if (isObject(value)) {
    for (const nestedValue of Object.values(value)) {
      yield* resolveVariables(nestedValue);
    }
  }
}

export const extractVariablesFromInput = (input: unknown): string[] => {
  return [...resolveVariables(input)];
};
