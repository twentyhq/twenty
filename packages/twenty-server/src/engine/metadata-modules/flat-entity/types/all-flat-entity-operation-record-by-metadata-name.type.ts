import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type FlatEntityOperationRecord<T extends AllMetadataName> = {
  flatEntityToCreate: Record<
    string,
    MetadataUniversalFlatEntity<T> & { id?: string }
  >;
  flatEntityToUpdate: Record<string, MetadataUniversalFlatEntity<T>>;
  flatEntityToDelete: Record<string, MetadataUniversalFlatEntity<T>>;
};

export type AllFlatEntityOperationRecordByMetadataName = {
  [P in AllMetadataName]?: FlatEntityOperationRecord<P>;
};
