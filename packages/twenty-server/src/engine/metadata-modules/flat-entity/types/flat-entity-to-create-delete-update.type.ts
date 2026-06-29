import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type FlatEntityToCreateDeleteUpdate<T extends AllMetadataName> = {
  flatEntityToUpdate: MetadataUniversalFlatEntity<T>[];
  flatEntityToCreate: (MetadataUniversalFlatEntity<T> & { id?: string })[];
  flatEntityToDelete: MetadataUniversalFlatEntity<T>[];
};

// Intention-carrying matrix: the create/update/delete operations to apply per
// metadata name. This is the single input contract shared by the metadata API and
// the application-sync paths, before it is folded into from/to maps for the builder.
export type AllFlatEntityOperationByMetadataName = {
  [P in AllMetadataName]?: FlatEntityToCreateDeleteUpdate<P>;
};
