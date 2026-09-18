import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export type ObjectRecordEventAuthor = Pick<
  ObjectRecordBaseEvent,
  | 'userId'
  | 'userWorkspaceId'
  | 'workspaceMemberId'
  | 'apiKeyId'
  | 'applicationId'
>;

export const buildObjectRecordEventAuthor = (
  authContext?: RawAuthContext,
): ObjectRecordEventAuthor => ({
  userId: authContext?.user?.id,
  userWorkspaceId: authContext?.userWorkspaceId,
  workspaceMemberId: authContext?.workspaceMemberId,
  apiKeyId: authContext?.apiKey?.id,
  applicationId: authContext?.application?.id,
});
