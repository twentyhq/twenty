import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';

export const applyWorkspaceMigrationUpdateActionUpdates = (
  action: UpdateFieldAction | UpdateObjectAction,
) => {
  return action.updates.reduce((acc, { to, property }) => {
    return {
      ...acc,
      [property]: to,
    };
  }, {});
};
