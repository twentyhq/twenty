export type ValidationRuleEvaluationResult =
  | { status: 'passed' }
  | { status: 'failed' }
  | { status: 'errored'; errorMessage: string };
