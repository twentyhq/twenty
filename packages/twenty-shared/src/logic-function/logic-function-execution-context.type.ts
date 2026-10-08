export type LogicFunctionExecutionContext = {
  retryCount: number;
  maxRetries: number;
  workspaceId: string;
  // Null for cron, install hooks and unauthenticated webhooks.
  userWorkspaceId: string | null;
  workspaceMemberId: string | null;
};

export type LogicFunctionRetryContext = Pick<
  LogicFunctionExecutionContext,
  'retryCount' | 'maxRetries'
>;
