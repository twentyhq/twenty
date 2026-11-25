// who a conversation is read for: turns other members opened ran under their permissions
export type AgentConversationViewer = {
  workspaceMemberId: string | undefined;
  applicationId?: string;
};
