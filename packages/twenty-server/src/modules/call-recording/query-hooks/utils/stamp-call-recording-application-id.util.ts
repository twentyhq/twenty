import { isDefined } from 'twenty-shared/utils';

import { type RecordInput } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type RequestingAuthContext = Pick<WorkspaceAuthContext, 'type'> & {
  application?: { id: string };
};

const getRequestingApplicationId = (
  authContext: RequestingAuthContext,
): string | undefined => {
  if (authContext.type === 'application' || authContext.type === 'user') {
    return authContext.application?.id;
  }

  return undefined;
};

export const stampCallRecordingApplicationId = ({
  authContext,
  records,
}: {
  authContext: RequestingAuthContext;
  records: RecordInput[];
}): RecordInput[] => {
  const applicationId = getRequestingApplicationId(authContext);

  if (!isDefined(applicationId)) {
    return records;
  }

  return records.map((record) => ({ ...record, applicationId }));
};
