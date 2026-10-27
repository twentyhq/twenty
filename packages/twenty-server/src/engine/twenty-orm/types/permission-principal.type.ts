export type PermissionPrincipal =
  | { type: 'userWorkspace'; userWorkspaceId: string }
  | { type: 'apiKey'; apiKeyId: string }
  | { type: 'agent'; agentId: string }
  | { type: 'application'; applicationId: string };
