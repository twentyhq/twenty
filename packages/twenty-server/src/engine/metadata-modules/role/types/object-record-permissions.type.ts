import { type ObjectPermissions } from 'twenty-shared/types';

export type ObjectRecordPermissions = Pick<
  ObjectPermissions,
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
>;
