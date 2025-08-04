import { QueryRunner } from 'typeorm';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type WorkspaceMigrationRunnerArgs = {
  action: WorkspaceMigrationActionV2;
  queryRunner: QueryRunner;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
