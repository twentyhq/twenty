import { type StepResult, type ToolSet } from 'ai';

export const extractToolExecutionErrors = (
  content: StepResult<ToolSet>['content'],
) => {
  const invalidToolCallIds = new Set(
    content.flatMap((part) =>
      part.type === 'tool-call' && part.invalid === true
        ? [part.toolCallId]
        : [],
    ),
  );

  return content.flatMap((part) =>
    part.type === 'tool-error' &&
    part.providerExecuted !== true &&
    !invalidToolCallIds.has(part.toolCallId)
      ? [part]
      : [],
  );
};
