/* @license Enterprise */

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordTargetInput } from 'src/engine/permissions/record-permissions/dtos/record-target.input';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

export type RecordSharingArgs = RecordTargetInput & {
  authContext: UserWorkspaceAuthContext;
  transactionScope?: RecordPermissionTransactionScope;
};
