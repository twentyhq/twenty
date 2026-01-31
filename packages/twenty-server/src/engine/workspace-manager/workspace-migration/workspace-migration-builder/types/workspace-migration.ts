import { type UniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigration<
  TActions extends
    UniversalWorkspaceMigrationAction = UniversalWorkspaceMigrationAction,
> = {
  actions: TActions[];
  workspaceId: string;
  applicationUniversalIdentifier: string;
};
