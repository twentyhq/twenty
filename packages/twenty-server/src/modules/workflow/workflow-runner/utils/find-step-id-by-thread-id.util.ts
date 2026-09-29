import { type WorkflowRunStepInfos } from 'twenty-shared/workflow';

// A run conversation names no step: the step is the one whose current
// execution recorded it, so a thread replaced by a retry or a later loop
// iteration belongs to no step anymore.
export const findStepIdByThreadId = ({
  stepInfos,
  threadId,
}: {
  stepInfos: WorkflowRunStepInfos;
  threadId: string;
}): string | undefined =>
  Object.keys(stepInfos).find(
    (stepId) => stepInfos[stepId]?.threadId === threadId,
  );
