export type PermissionTestRoleGrant = 'none' | 'rowLevel' | 'allRecords';

export type PermissionTestPrincipals = {
  mainPrincipal:
    | { type: 'workspaceMember' | 'apiKey'; role: PermissionTestRoleGrant }
    | { type: 'application' | 'agent'; role: 'allRecords' };
  limitingPrincipal:
    | { type: 'none' }
    | { type: 'agent'; role: PermissionTestRoleGrant }
    | { type: 'agentWithoutRole' };
  applicationPrincipal:
    | { type: 'customApplication' }
    | { type: 'oauthApplication' }
    | { type: 'sameApplicationAsMain' }
    | { type: 'application'; role: PermissionTestRoleGrant };
};

export type PermissionTestRecordName =
  | 'insideEveryFilter'
  | 'outsideStatusFilter'
  | 'outsideCategoryFilter'
  | 'outsideRegionFilter';

export type PermissionTestWorkspace = {
  workspaceId: string;
  objectMetadataId: string;
  objectNameSingular: string;
  roleIds: Record<PermissionTestRoleGrant, string>;
  workspaceMemberIds: Record<PermissionTestRoleGrant, string>;
  apiKeyIds: Record<PermissionTestRoleGrant, string>;
  webhookId: string;
  limitingAgentIds: Record<PermissionTestRoleGrant, string>;
  limitingAgentWithoutRoleId: string;
  mainAgentId: string;
  applicationIds: Record<PermissionTestRoleGrant, string>;
  mainApplicationId: string;
  oauthApplicationId: string;
  recordIds: Record<PermissionTestRecordName, string>;
};

export type PermissionTestExpectedAnswers = {
  findRecordsActions: {
    canRead: boolean;
    canUpdate: boolean;
    canSoftDelete: boolean;
    canDelete: boolean;
  };
  canReadRecords: boolean;
  canUpdateRecords: boolean;
};
