export type LogicFunctionExecutionContext = {
  retryCount: number;
  maxRetries: number;
  workspaceId: string;
  // Null when nobody triggered the run: cron, install hooks and
  // unauthenticated webhooks have no person behind them.
  userWorkspaceId: string | null;
  workspaceMemberId: string | null;
};

export type LogicFunctionRetryContext = Pick<
  LogicFunctionExecutionContext,
  'retryCount' | 'maxRetries'
>;
