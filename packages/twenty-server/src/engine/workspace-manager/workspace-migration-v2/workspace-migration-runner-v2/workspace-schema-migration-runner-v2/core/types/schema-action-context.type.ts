import { type QueryRunner } from 'typeorm';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type SchemaActionContext<T = WorkspaceMigrationActionV2> = {
  action: T;
  queryRunner: QueryRunner;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
