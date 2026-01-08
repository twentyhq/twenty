import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigrationActionRunnerArgs<
  T extends WorkspaceMigrationAction,
> = {
  queryRunner: QueryRunner;
  action: T;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
};
