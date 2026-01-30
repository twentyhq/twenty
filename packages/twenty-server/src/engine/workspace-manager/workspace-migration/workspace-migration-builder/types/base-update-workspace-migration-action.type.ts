import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';

export type BaseUpdateWorkspaceMigrationAction<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T] extends {
    universalMigrated: {
      runner: true;
    };
  }
    ? {
        type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.update;
        metadataName: T;
        entityId?: undefined;
        universalIdentifier: string;
        // TODO remove when builder migrated
        updates: FlatEntityPropertiesUpdates<T>;
      }
    : {
        type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.update;
        metadataName: T;
        entityId: string;
        universalIdentifier?: undefined;
        updates: FlatEntityPropertiesUpdates<T>;
      };
