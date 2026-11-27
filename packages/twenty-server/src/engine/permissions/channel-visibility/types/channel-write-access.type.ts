import { type ObjectRecordsPermissions } from 'twenty-shared/types';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export type ChannelWriteAccess = Pick<
  ObjectRecordsPermissions,
  | 'canCreateAllRecords'
  | 'canUpdateAllRecords'
  | 'canSoftDeleteAllRecords'
  | 'canDestroyAllRecords'
>;
