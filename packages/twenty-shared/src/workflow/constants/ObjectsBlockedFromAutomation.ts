// Objects whose records must not be created, updated, or deleted by
// automation callers (workflows and AI tools): they back the automation
// runtime itself (recursion risk) or gate access.
export const OBJECTS_BLOCKED_FROM_AUTOMATION = [
  'workflow',
  'workflowVersion',
  'workflowRun',
  'workflowAutomatedTrigger',
  'workspaceMember',
  'dashboard',
  'agentChatThread',
] as const;
