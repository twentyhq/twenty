import { WorkflowActionType } from 'twenty-shared/workflow';

export const WORKFLOW_STEP_MAX_ATTEMPTS = 3;

// Replaying these repeats an effect the failed attempt already committed: the
// iterator and the round robin have advanced a durable cursor, an agent has
// already made its tool calls, and a delay has already queued the job that
// resumes the run, which fails the run outright if it is queued twice.
export const NON_REPLAYABLE_WORKFLOW_ACTION_TYPES: WorkflowActionType[] = [
  WorkflowActionType.ITERATOR,
  WorkflowActionType.PICK_RECORD,
  WorkflowActionType.AI_AGENT,
  WorkflowActionType.DELAY,
];
