import { WorkspaceMigrationActionV2 } from "src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2";

export type CreatedDeletedUpdatedActions<
  TActions extends WorkspaceMigrationActionV2,
> = {
  created: TActions[];
  deleted: TActions[];
  updated: TActions[];
};