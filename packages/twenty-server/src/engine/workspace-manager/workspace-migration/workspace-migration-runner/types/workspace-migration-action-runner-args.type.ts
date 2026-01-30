import { type QueryRunner } from 'typeorm';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type UniversalAllFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-all-flat-entity-maps.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigrationActionRunnerArgs<
  T extends WorkspaceMigrationAction,
> = {
  queryRunner: QueryRunner;
  action: T;
  allFlatEntityMaps: UniversalAllFlatEntityMaps;
  workspaceId: string;
  flatApplication: FlatApplication;
};
