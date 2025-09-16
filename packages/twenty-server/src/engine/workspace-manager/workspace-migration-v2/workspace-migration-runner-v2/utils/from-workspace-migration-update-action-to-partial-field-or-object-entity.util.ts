import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type UpdateIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type UpdateIndexFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-field-action-v2';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { type UpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';

export const fromWorkspaceMigrationUpdateActionToPartialEntity = <
  T extends
    | UpdateFieldAction
    | UpdateObjectAction
    | UpdateViewAction
    | UpdateViewFieldAction
    | UpdateIndexAction
    | UpdateIndexFieldAction,
>(
  action: T,
) => {
  return action.updates.reduce((acc, { to, property }) => {
    return {
      ...acc,
      [property]: to,
    };
  }, {});
};
