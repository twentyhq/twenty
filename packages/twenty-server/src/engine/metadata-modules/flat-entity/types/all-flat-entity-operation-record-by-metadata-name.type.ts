import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type FlatEntityOperationRecord<T extends AllMetadataName> = {
  flatEntityToCreate: Partial<
    Record<string, MetadataUniversalFlatEntity<T> & { id?: string }>
  >;
  flatEntityToUpdate: Partial<Record<string, MetadataUniversalFlatEntity<T>>>;
  flatEntityToDelete: Partial<Record<string, MetadataUniversalFlatEntity<T>>>;
};

export type AllFlatEntityOperationRecordByMetadataName = {
  [P in AllMetadataName]?: FlatEntityOperationRecord<P>;
};
