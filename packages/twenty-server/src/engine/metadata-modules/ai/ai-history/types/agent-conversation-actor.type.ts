export type AgentConversationActor =
  | { type: 'user'; workspaceMemberId: string }
  | { type: 'application'; applicationId: string };
