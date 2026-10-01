// A workflow run's conversation belongs to the run, so bulk record operations
// on chats never reach it.
export const excludeWorkflowRunThreadsFromFilter = <TFilter>(
  filter: TFilter,
): { and: [TFilter, { workflowRunId: { is: 'NULL' } }] } => ({
  and: [filter, { workflowRunId: { is: 'NULL' } }],
});
