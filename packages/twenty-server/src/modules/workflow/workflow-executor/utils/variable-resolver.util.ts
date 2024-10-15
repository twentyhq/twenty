import { isNil, isString } from '@nestjs/common/utils/shared.utils';

import Handlebars from 'handlebars';

import {
  WorkflowExecutorException,
  WorkflowExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-executor.exception';

const VARIABLE_PATTERN = RegExp('\\{\\{(.*?)\\}\\}', 'g');

export const resolve = (
  unresolvedInput: any,
  context: Record<string, object>,
) => {
  if (isNil(unresolvedInput)) {
    return unresolvedInput;
  }

  if (isString(unresolvedInput)) {
    return resolveString(unresolvedInput, context);
  }

  const resolvedInput = unresolvedInput;

  if (Array.isArray(unresolvedInput)) {
    for (let i = 0; i < unresolvedInput.length; ++i) {
      resolvedInput[i] = resolve(unresolvedInput[i], context);
    }
  } else if (typeof unresolvedInput === 'object') {
    const entries = Object.entries(unresolvedInput);

    for (const [key, value] of entries) {
      resolvedInput[key] = resolve(value, context);
    }
  }

  return resolvedInput;
};

const resolveString = (
  input: string,
  context: Record<string, object>,
): string => {
  const matchedTokens = input.match(VARIABLE_PATTERN);

  if (!matchedTokens || matchedTokens.length === 0) {
    return input;
  }

  if (matchedTokens.length === 1 && matchedTokens[0] === input) {
    return evalFromContext(input, context);
  }

  return input.replace(VARIABLE_PATTERN, (matchedToken, _) => {
    const processedToken = evalFromContext(matchedToken, context);

    return processedToken;
  });
};

const evalFromContext = (
  input: string,
  context: Record<string, object>,
): string => {
  try {
    const inferredInput = Handlebars.compile(input)(context);

    return inferredInput ?? '';
  } catch (exception) {
    throw new WorkflowExecutorException(
      `Failed to evaluate variable ${input}: ${exception}`,
      WorkflowExecutorExceptionCode.VARIABLE_EVALUATION_FAILED,
    );
  }
};
