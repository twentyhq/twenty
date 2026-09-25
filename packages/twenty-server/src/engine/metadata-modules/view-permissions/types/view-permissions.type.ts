export type ViewChildEntityKind =
  | 'viewField'
  | 'viewFieldGroup'
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
