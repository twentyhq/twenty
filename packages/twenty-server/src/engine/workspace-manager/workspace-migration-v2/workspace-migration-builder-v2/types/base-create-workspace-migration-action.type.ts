import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type BaseCreateWorkspaceMigrationAction<T extends AllMetadataName> = {
  flatEntity: MetadataFlatEntity<T>;
  type: 'create';
  metadataName: T;
};
