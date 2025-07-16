import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { QueryRunner } from 'typeorm';

export type WorkspaceMigrationActionRunnerArgs<
  T extends WorkspaceMigrationActionV2,
> = {
  queryRunner: QueryRunner;
  action: T;
};
