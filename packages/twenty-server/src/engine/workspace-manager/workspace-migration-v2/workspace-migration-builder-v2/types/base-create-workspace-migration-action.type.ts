import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type BaseCreateWorkspaceMigrationAction<T extends AllMetadataName> = {
  flatEntity: MetadataFlatEntity<T>;
  type: 'create';
  metadataName: T;
};
