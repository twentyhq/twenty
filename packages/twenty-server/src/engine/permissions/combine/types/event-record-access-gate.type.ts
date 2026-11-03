/* @license Enterprise */

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    authContext: WorkspaceAuthContext,
  ) => Promise<Set<string>>;
};
