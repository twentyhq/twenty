import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigration<
  TActions extends WorkspaceMigrationAction = WorkspaceMigrationAction,
> = {
  actions: TActions[];
  workspaceId: string;
};
