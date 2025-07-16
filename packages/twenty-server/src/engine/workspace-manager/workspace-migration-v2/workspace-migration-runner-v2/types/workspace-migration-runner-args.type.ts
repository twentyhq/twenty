import { QueryRunner } from 'typeorm';

import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type WorkspaceMigrationRunnerArgs = {
  workspaceMigration: WorkspaceMigrationV2;
  queryRunner: QueryRunner;
};
