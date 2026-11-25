import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

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
  authContext?: WorkspaceAuthContext;
};
