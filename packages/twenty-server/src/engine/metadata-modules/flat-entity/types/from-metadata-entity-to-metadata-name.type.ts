import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';
import { AllMetadataName } from 'twenty-shared/metadata';

export type FromMetadataEntityToMetadataName<T extends SyncableEntity> = {
  [P in AllMetadataName]: AllFlatEntityTypesByMetadataName[P] extends {
    entity: T;
  }
    ? P
    : never;
}[AllMetadataName];
