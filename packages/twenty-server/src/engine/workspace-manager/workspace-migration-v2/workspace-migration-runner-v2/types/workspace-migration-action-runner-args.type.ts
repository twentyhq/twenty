import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type WorkspaceMigrationActionRunnerArgs<
  T extends WorkspaceMigrationActionV2,
> = {
  queryRunner: QueryRunner;
  action: T;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
};
