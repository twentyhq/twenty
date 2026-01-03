import { FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type BaseUpdateWorkspaceMigrationAction<T extends AllMetadataName> = {
  type: 'update';
  metadataName: T;
  entityId: string;
  updates: FlatEntityPropertiesUpdates<T>;
};
