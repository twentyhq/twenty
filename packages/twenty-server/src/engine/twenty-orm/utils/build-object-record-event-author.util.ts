import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type ObjectRecordEventAuthorContext = Pick<
  WorkspaceAuthContext,
  'type'
> & {
  user?: { id: string } | null;
  userWorkspaceId?: string;
  workspaceMemberId?: string;
  apiKey?: { id: string } | null;
  application?: { id: string } | null;
  // An agent running as a workspace member carries the initiating app here,
  // leaving `application` unset.
  viaApplication?: { id: string } | null;
};

export type ObjectRecordEventAuthor = Pick<
  ObjectRecordBaseEvent,
  | 'userId'
  | 'userWorkspaceId'
  | 'workspaceMemberId'
  | 'apiKeyId'
  | 'applicationId'
>;

export const buildObjectRecordEventAuthor = (
  authContext?: ObjectRecordEventAuthorContext,
): ObjectRecordEventAuthor => ({
  userId: authContext?.user?.id,
  userWorkspaceId: authContext?.userWorkspaceId,
  workspaceMemberId: authContext?.workspaceMemberId,
  apiKeyId: authContext?.apiKey?.id,
  applicationId:
    authContext?.application?.id ?? authContext?.viaApplication?.id,
});
