import { type AllMetadataName } from 'twenty-shared/metadata';

import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type BaseUpdateWorkspaceMigrationAction<T extends AllMetadataName> = {
  type: 'update';
  metadataName: T;
  entityId: string;
  updates: FlatEntityPropertiesUpdates<T>;
};
