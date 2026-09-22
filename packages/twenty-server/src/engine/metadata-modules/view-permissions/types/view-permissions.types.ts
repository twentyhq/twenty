export type ViewChildEntityKind =
  | 'viewField'
  | 'viewFilter'
  | 'viewFilterGroup'
  | 'viewGroup'
  | 'viewSort';

export type ViewAccessContext = {
  workspaceId: string;
  userWorkspaceId?: string;
  apiKeyId?: string;
  applicationId?: string;
};
