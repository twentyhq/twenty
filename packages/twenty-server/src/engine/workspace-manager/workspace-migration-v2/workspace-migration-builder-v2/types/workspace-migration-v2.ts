import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type WorkspaceMigrationV2<
  TActions extends WorkspaceMigrationActionV2 = WorkspaceMigrationActionV2,
> = {
  // formatVersion: 1;
  // createdAt: string;
  // name: string;
  // description?: string;
  actions: TActions[];
  workspaceId: string;
  // objectActions: TActions[] // could be cool ?
};
