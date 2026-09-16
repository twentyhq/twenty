import { isObject, isString } from '@sniptt/guards';

import { evalFromContext } from '@/utils/evalFromContext';
import { isDefined } from '@/utils/validation';

const VARIABLE_PATTERN = RegExp('\\{\\{([^{}]+)\\}\\}', 'g');

export const isVariableReference = (input: unknown): boolean =>
  isString(input) && isDefined(input.match(VARIABLE_PATTERN));

export const resolveInput = (
  unresolvedInput: unknown,
  context: Record<string, unknown>,
): unknown => {
  if (!isDefined(unresolvedInput)) {
    return unresolvedInput;
  }

  if (isString(unresolvedInput)) {
    return resolveString(unresolvedInput, context);
  }

  if (Array.isArray(unresolvedInput)) {
    return resolveArray(unresolvedInput, context);
  }

  if (isObject(unresolvedInput)) {
    return resolveObject(unresolvedInput, context);
  }

  return unresolvedInput;
};

const resolveArray = (
  input: unknown[],
  context: Record<string, unknown>,
): unknown[] => {
  const resolvedArray = input;

  for (let i = 0; i < input.length; ++i) {
    resolvedArray[i] = resolveInput(input[i], context);
  }

  return resolvedArray;
};

const resolveObject = (
  input: object,
  context: Record<string, unknown>,
): object => {
  return Object.entries(input).reduce<Record<string, unknown>>(
    (resolvedObject, [key, value]) => {
      const resolvedKey = resolveInput(key, context);

      resolvedObject[
        isString(resolvedKey) ? resolvedKey : String(resolvedKey)
      ] = resolveInput(value, context);

      return resolvedObject;
    },
    {},
  );
};

export const resolveStringTemplate = (
  input: string,
  context: Record<string, unknown>,
): string => {
  return input.replace(VARIABLE_PATTERN, (matchedToken, _) => {
    const processedToken = evalFromContext(matchedToken, context);

    if (isObject(processedToken)) {
      return JSON.stringify(processedToken);
    }

    return String(processedToken);
  });
};

// Returns the resolved value itself when the whole string is one variable, so
// `{{step.amount}}` keeps its type instead of being stringified
const resolveString = (
  input: string,
  context: Record<string, unknown>,
): unknown => {
  const matchedTokens = input.match(VARIABLE_PATTERN);

  if (!matchedTokens || matchedTokens.length === 0) {
    return input;
  }

  if (matchedTokens.length === 1 && matchedTokens[0] === input) {
    return evalFromContext(input, context);
  }

  return resolveStringTemplate(input, context);
};
