export type WorkspaceBroadcastEvent = {
  type: 'created' | 'updated' | 'deleted';
  entityName: string;
  recordId: string;
  properties: {
    updatedFields?: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
  };
  // Restricts delivery to streams whose authContext.userWorkspaceId is in this
  // list. Omit for workspace-wide events (shared metadata like views, objects,
  // fields). Set for user-scoped entities (e.g. agentChatThread) so other users
  // in the same workspace don't receive them.
  recipientUserWorkspaceIds?: string[];
};
