export type WorkflowWaitResolution =
  | { result: object }
  // The step runs again on its conversation, where it recorded the outcome
  | { resumedThreadId: string };
