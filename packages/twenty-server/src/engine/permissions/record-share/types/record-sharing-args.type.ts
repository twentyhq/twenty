/* @license Enterprise */

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordTargetInput } from 'src/engine/permissions/record-permissions/dtos/record-target.input';

export type RecordSharingArgs = RecordTargetInput & {
  authContext: UserWorkspaceAuthContext;
};
