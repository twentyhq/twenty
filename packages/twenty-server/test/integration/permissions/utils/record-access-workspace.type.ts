export type RoleGrant = 'none' | 'rowLevel' | 'allRecords';

export type RecordAccessPrincipals = {
  mainPrincipal:
    | { type: 'workspaceMember' | 'apiKey'; role: RoleGrant }
    | { type: 'application' | 'agent'; role: 'allRecords' };
  limitingPrincipal:
    | { type: 'none' }
    | { type: 'agent'; role: RoleGrant }
    | { type: 'agentWithoutRole' };
  applicationPrincipal:
    | { type: 'customApplication' }
    | { type: 'oauthApplication' }
    | { type: 'sameApplicationAsMain' }
    | { type: 'application'; role: RoleGrant };
};

export type RecordAccessRecordName =
  | 'insideEveryFilter'
  | 'outsideStatusFilter'
  | 'outsideCategoryFilter'
  | 'outsideRegionFilter';

export type RecordAccessWorkspace = {
  workspaceId: string;
  objectMetadataId: string;
  objectNameSingular: string;
  roleIds: Record<RoleGrant, string>;
  workspaceMemberIds: Record<RoleGrant, string>;
  apiKeyIds: Record<RoleGrant, string>;
  webhookId: string;
  limitingAgentIds: Record<RoleGrant, string>;
  limitingAgentWithoutRoleId: string;
  mainAgentId: string;
  applicationIds: Record<RoleGrant, string>;
  mainApplicationId: string;
  oauthApplicationId: string;
  recordIds: Record<RecordAccessRecordName, string>;
};

export type ExpectedRecordAccess = {
  findRecordsPermissions: {
    canRead: boolean;
    canUpdate: boolean;
    canSoftDelete: boolean;
    canDelete: boolean;
  };
  canReadRecords: boolean;
  canUpdateRecords: boolean;
};
