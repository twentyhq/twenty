import { isNonEmptyString, isString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  type ExtendedUIMessagePart,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-awaiting-pausing-tool-output.util';

const readNonEmptyString = (value: unknown): string | null =>
  isString(value) && isNonEmptyString(value.trim()) ? value : null;

const readAwaitingCallText = ({
  toolName,
  input,
  output,
}: {
  toolName: string;
  input: unknown;
  output: unknown;
}): string | null => {
  const callInput = isPlainObject(input) ? input : {};

  switch (toolName) {
    case ASK_QUESTION_TOOL_NAME:
      return readNonEmptyString(callInput.question);
    case REQUEST_FORM_TOOL_NAME: {
      const fieldLabels = (
        Array.isArray(callInput.fields) ? callInput.fields : []
      )
        .map((field) =>
          isPlainObject(field) ? readNonEmptyString(field.label) : null,
        )
        .filter(isDefined);

      return fieldLabels.length > 0 ? fieldLabels.join(', ') : null;
    }
    case PROPOSE_TOOL_CALL_TOOL_NAME: {
      // The server resolves the proposal shown to the member into the pending output
      const proposal =
        isPlainObject(output) &&
        isPlainObject(output.result) &&
        isPlainObject(output.result.proposal)
          ? output.result.proposal
          : {};

      return (
        readNonEmptyString(proposal.summary) ??
        readNonEmptyString(callInput.summary)
      );
    }
    default:
      return null;
  }
};

export const findAwaitingCallText = (
  parts: ExtendedUIMessagePart[],
): string | null =>
  parts
    .flatMap((part) => {
      // A call that failed was never shown to the member
      if (!isToolUIPart(part) || !isAwaitingPausingToolOutput(part.output)) {
        return [];
      }

      const text = readAwaitingCallText({
        toolName: getToolName(part),
        input: part.input,
        output: part.output,
      });

      return isDefined(text) ? [text] : [];
    })
    .pop() ?? null;
