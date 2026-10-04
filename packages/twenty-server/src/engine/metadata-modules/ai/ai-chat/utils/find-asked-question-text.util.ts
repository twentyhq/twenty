import { isNonEmptyString, isString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';

export const findAskedQuestionText = (
  parts: ExtendedUIMessagePart[],
): string | null =>
  parts
    .flatMap((part) => {
      // A call that failed was never shown to the member
      if (
        !isToolUIPart(part) ||
        getToolName(part) !== ASK_QUESTION_TOOL_NAME ||
        !isAwaitingPausingToolOutput(part.output)
      ) {
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
