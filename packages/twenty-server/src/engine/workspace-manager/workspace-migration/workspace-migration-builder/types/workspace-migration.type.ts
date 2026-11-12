import { type AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common.type';

export type WorkspaceMigration<
  TActions extends AllUniversalWorkspaceMigrationAction =
    AllUniversalWorkspaceMigrationAction,
> = {
  actions: TActions[];
  applicationUniversalIdentifier: string;
  // Generated deletions mapped to the deletion that made the side-effect engine emit them.
  deletionTriggerByUniversalIdentifier?: Record<string, string>;
};
