import { type QueryRunner } from 'typeorm';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { IsMetadataRunnerUniversalMigrated } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/is-metadata-runner-universal-migrated.type';
import { TranspileActionUniversalToFlat } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/transpile-action-to-flat.type';
import { type WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type WorkspaceMigrationActionRunnerArgs<
  T extends WorkspaceMigrationAction,
> = {
  queryRunner: QueryRunner;
  action: T;
  flatAction: IsMetadataRunnerUniversalMigrated<T['metadataName']> extends true
    ? TranspileActionUniversalToFlat<T>
    : T;
  allFlatEntityMaps: AllFlatEntityMaps;
  workspaceId: string;
  flatApplication: FlatApplication;
};
