import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const FLAT_ROLE_EDITABLE_PROPERTIES: (keyof FlatRole)[] = [
  'label',
  'description',
  'icon',
  'canUpdateAllSettings',
  'canAccessAllTools',
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
  'canBeAssignedToUsers',
  'canBeAssignedToAgents',
  'canBeAssignedToApiKeys',
];
