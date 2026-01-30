import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseCreateWorkspaceMigrationAction<T extends AllMetadataName> = {
  flatEntity: AllFlatEntityTypesByMetadataName[T] extends {
    universalMigrated: {
      runner: true;
    };
  }
    ? MetadataUniversalFlatEntity<T>
    : MetadataFlatEntity<T>;
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.create;
  metadataName: T;
};
