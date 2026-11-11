import { type RecordSharingMetadata } from 'src/engine/permissions/internal/record-share/utils/resolve-record-sharing-metadata-or-throw.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

export type RecordSharingChange = {
  workspaceId: string;
  transactionScope: RecordPermissionTransactionScope;
  sharingMetadata: RecordSharingMetadata;
  creatorWorkspaceMemberId: string | undefined;
};
