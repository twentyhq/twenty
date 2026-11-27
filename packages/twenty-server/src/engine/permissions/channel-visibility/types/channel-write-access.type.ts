import { type ObjectRecordsPermissions } from 'twenty-shared/types';

export type ChannelWriteAccess = Pick<
  ObjectRecordsPermissions,
  | 'canCreateAllRecords'
  | 'canUpdateAllRecords'
  | 'canSoftDeleteAllRecords'
  | 'canDestroyAllRecords'
>;
