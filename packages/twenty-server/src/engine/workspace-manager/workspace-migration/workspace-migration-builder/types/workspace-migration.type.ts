import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigration<
  TActions extends
    AllUniversalWorkspaceMigrationAction = AllUniversalWorkspaceMigrationAction,
> = {
  actions: TActions[];
  applicationUniversalIdentifier: string;
};
