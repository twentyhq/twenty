export type CreateRoleTargetInput = {
  roleId: string;
  applicationId?: string;
  universalIdentifier?: string;
  targetId: string;
  targetMetadata: 'userWorkspaceId' | 'agentId' | 'apiKeyId';
};
