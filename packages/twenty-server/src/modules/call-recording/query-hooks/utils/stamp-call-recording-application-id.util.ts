import { isDefined } from 'twenty-shared/utils';

import { type RecordInput } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

const getRequestingApplicationId = (
  authContext: WorkspaceAuthContext,
): string | undefined => {
  if (isApplicationAuthContext(authContext) || isUserAuthContext(authContext)) {
    return authContext.application?.id;
  }

  return undefined;
};

export const stampCallRecordingApplicationId = ({
  authContext,
  records,
}: {
  authContext: WorkspaceAuthContext;
  records: RecordInput[];
}): RecordInput[] => {
  const applicationId = getRequestingApplicationId(authContext);

  if (!isDefined(applicationId)) {
    return records;
  }

  return records.map((record) => ({ ...record, applicationId }));
};
