import { isNonEmptyString, isString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

export const findAskedQuestionText = (
  parts: ExtendedUIMessagePart[],
): string | null =>
  parts
    .flatMap((part) => {
      if (!isToolUIPart(part) || getToolName(part) !== ASK_QUESTION_TOOL_NAME) {
        return [];
      }

      const question = isPlainObject(part.input)
        ? part.input.question
        : undefined;

      return isString(question) && isNonEmptyString(question.trim())
        ? [question]
        : [];
    })
    .pop() ?? null;
