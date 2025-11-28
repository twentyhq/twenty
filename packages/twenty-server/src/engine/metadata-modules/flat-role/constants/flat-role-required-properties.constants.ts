import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const FLAT_ROLE_REQUIRED_PROPERTIES = [
  'label',
  'canUpdateAllSettings',
  'canAccessAllTools',
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
] as const satisfies (keyof FlatRole)[];
