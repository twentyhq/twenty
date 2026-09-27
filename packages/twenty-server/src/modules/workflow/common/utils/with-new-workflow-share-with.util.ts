import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';

// A workflow is a private record only so its runs can inherit its visibility;
// that visibility lives on the core workflow, and one created through the
// record API starts visible to the workspace. Callers that are not people must
// name whom a private record is shared with, so they are spared restating what
// the workflow already is. syncWorkflowRecordShares owns every everyone grant
// on a workflow, so this one is withdrawn with the rest if it turns private.
export const withNewWorkflowShareWith = <
  TPayload extends { shareWith?: ShareWithInput[] },
>({
  authContext,
  payload,
}: {
  authContext: WorkspaceAuthContext;
  payload: TPayload;
}): TPayload => {
  if (isUserAuthContext(authContext) || isNonEmptyArray(payload.shareWith)) {
    return payload;
  }

  return {
    ...payload,
    shareWith: [{ everyone: true, accessLevel: RecordShareAccessLevel.FULL }],
  };
};
