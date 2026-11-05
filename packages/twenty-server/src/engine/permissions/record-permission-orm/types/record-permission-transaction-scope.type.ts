import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';

export type RecordPermissionTransactionScope = Pick<
  WorkspaceTransactionScope,
  'workspaceId' | 'executeRawQuery'
>;
