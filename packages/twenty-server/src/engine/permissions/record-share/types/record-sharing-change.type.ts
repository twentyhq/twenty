import { type FeatureFlagKey } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';

export type RecordSharingChange = {
  workspaceId: string;
  transactionScope: RecordPermissionTransactionScope;
  flatObjectMetadata: FlatObjectMetadata;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  creatorWorkspaceMemberId: string | undefined;
};
