import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigration<
  TActions extends WorkspaceMigrationAction = WorkspaceMigrationAction,
> = {
  actions: TActions[];
  workspaceId: string;
  // TODO remove from workspaceMigration once we've refactored the actions to have metadata and action type grain
  relatedFlatEntityMapsKeys?: (keyof AllFlatEntityMaps)[];
};
