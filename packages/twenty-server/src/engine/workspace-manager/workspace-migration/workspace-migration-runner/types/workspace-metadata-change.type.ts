import { type AllMetadataName } from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export type WorkspaceMetadataChange = {
  metadataName: AllMetadataName;
  actionType: WorkspaceMigrationActionType;
  updatedProperties?: string[];
};
