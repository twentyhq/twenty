import { type RecordSharingObject } from 'src/engine/permissions/internal/record-share/utils/resolve-record-sharing-object-or-throw.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

export type RecordSharingChange = {
  workspaceId: string;
  transactionScope: RecordPermissionTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};
