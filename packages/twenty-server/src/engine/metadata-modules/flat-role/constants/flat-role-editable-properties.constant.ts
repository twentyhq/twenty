import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_ROLE_EDITABLE_PROPERTIES: MetadataEntityPropertyName<'role'>[] =
  [
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
