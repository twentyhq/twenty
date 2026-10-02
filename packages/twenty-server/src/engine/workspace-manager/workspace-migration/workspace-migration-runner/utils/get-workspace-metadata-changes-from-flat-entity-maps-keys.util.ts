import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { type WorkspaceMetadataChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-metadata-change.type';

// Without the actions, any kind of change to the given maps has to be assumed
export const getWorkspaceMetadataChangesFromFlatEntityMapsKeys = (
  flatEntityMapsKeys: (keyof AllFlatEntityMaps)[],
): WorkspaceMetadataChange[] =>
  Object.values(ALL_METADATA_NAME)
    .filter((metadataName) =>
      flatEntityMapsKeys.includes(getMetadataFlatEntityMapsKey(metadataName)),
    )
    .flatMap((metadataName) =>
      Object.values(WORKSPACE_MIGRATION_ACTION_TYPE).map((actionType) => ({
        metadataName,
        actionType,
      })),
    );
