import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type ExtractUniversalForeignKeyAggregatorForMetadataName } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-flat-entity-foreign-key-aggregator-properties.constant';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUniversalCreateWorkspaceMigrationAction<
  T extends AllMetadataName,
> = {
  flatEntity: Omit<
    MetadataUniversalFlatEntity<T>,
    ExtractUniversalForeignKeyAggregatorForMetadataName<T>
  >;
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.create;
  metadataName: T;
  // Optional ID to use when creating the entity (for API metadata).
  // If not provided, a new UUID will be generated.
  id?: string;
};
