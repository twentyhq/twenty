import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

export type DerivedWorkspaceCacheInvalidationTrigger = {
  [TMetadataName in AllMetadataName]: {
    metadataName: TMetadataName;
    actionTypes?: readonly WorkspaceMigrationActionType[];
    // Restricts update actions to the ones touching these properties
    updatedProperties?: readonly (keyof UniversalFlatEntityUpdate<TMetadataName> &
      string)[];
  };
}[AllMetadataName];
