import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUniversalCreateWorkspaceMigrationAction<
  T extends AllMetadataName,
> = {
  // TODO prastoin rename to universalFlatEntity ?
  flatEntity: MetadataUniversalFlatEntity<T>;
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.create;
  metadataName: T;
};
