import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { type SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

export type FromMetadataEntityToMetadataName<T extends SyncableEntity> = {
  [P in AllMetadataName]: AllFlatEntityTypesByMetadataName[P] extends {
    entity: T;
  }
    ? P
    : never;
}[AllMetadataName];
