import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntityComparablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

// Properties a workspace owns on the entities an application ships: the
// application creates them with a default, then leaves whatever the workspace
// chose, instead of resetting it on every synchronization.
export const WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME: Partial<{
  [P in AllMetadataName]: MetadataEntityComparablePropertyName<P>[];
}> = {
  pageLayout: ['isFirstTabPinned'],
  skill: ['isActive'],
  view: ['createdByUserWorkspaceId'],
};
