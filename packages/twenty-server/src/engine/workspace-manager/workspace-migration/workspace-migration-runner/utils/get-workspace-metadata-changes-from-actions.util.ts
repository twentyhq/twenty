import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';
import { type WorkspaceMetadataChange } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-metadata-change.type';

export const getWorkspaceMetadataChangesFromActions = (
  actions: AllUniversalWorkspaceMigrationAction[],
): WorkspaceMetadataChange[] =>
  actions.map((action) =>
    action.type === 'update'
      ? {
          metadataName: action.metadataName,
          actionType: action.type,
          updatedProperties: Object.keys(action.update),
        }
      : { metadataName: action.metadataName, actionType: action.type },
  );
