export type AgentConversationActor =
  | { type: 'user'; userWorkspaceId: string }
  | { type: 'application'; applicationId: string };
