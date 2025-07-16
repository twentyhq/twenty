import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { QueryRunner } from 'typeorm';

export type WorkspaceMigrationRunnerArgs = {
  workspaceMigration: WorkspaceMigrationV2;
  queryRunner: QueryRunner;
};
