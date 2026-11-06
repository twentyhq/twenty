import { type RoleGrant } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';

export type ActorsByRole = Record<RoleGrant, string>;

export type RecordAccessWorkspaceMember = {
  workspaceMemberId: string;
  accessToken: string;
};

export type RecordAccessRecordName =
  | 'insideEveryFilter'
  | 'outsideStatusFilter'
  | 'outsideCategoryFilter'
  | 'outsideRegionFilter'
  | 'sharedReadToNoAccessMember'
  | 'sharedWriteToNoAccessMember'
  | 'sharedFullToNoAccessMember'
  | 'sharedReadToAnotherMember'
  | 'sharedReadToNoAccessRole'
  | 'privateSharedFullToAllRecordsMember'
  | 'privateSharedWriteToAllRecordsMember';

export type RecordAccessWorkspace = {
  workspaceId: string;
  adminAccessToken: string;
  objectMetadataId: string;
  objectNameSingular: string;
  mainRoleIds: ActorsByRole;
  members: Record<keyof ActorsByRole, RecordAccessWorkspaceMember>;
  apiKeyIds: ActorsByRole;
  webhookId: string;
  limitingAgentIds: ActorsByRole;
  mainAgentId: string;
  applicationIds: ActorsByRole;
  mainApplicationId: string;
  oauthApplicationId: string;
  recordIds: Record<RecordAccessRecordName, string>;
};
