import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import { type ToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-history/types/tool-call-workflow-step.type';

// A pending call names the step that waits on it, so its answer or outcome
// resumes that step even in a conversation other runs also write to
export const stampPendingToolPartsWithWorkflowStep = ({
  parts,
  workflowStep,
}: {
  parts: ExtendedUIMessagePart[];
  workflowStep: ToolCallWorkflowStep;
}): ExtendedUIMessagePart[] =>
  parts.map((part) =>
    isToolUIPart(part) &&
    isPlainObject(part.output) &&
    isAwaitingPausingToolOutput(part.output)
      ? ({
          ...part,
          output: { ...part.output, workflowStep },
        } as ExtendedUIMessagePart)
      : part,
  );
