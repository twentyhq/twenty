import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type FlatEntityToCreateDeleteUpdate<T extends AllMetadataName> = {
  flatEntityToUpdate: MetadataUniversalFlatEntity<T>[];
  flatEntityToCreate: (MetadataUniversalFlatEntity<T> & { id?: string })[];
  flatEntityToDelete: MetadataUniversalFlatEntity<T>[];
};
