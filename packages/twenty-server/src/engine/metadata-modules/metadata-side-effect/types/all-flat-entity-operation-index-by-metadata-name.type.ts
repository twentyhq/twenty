import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type FlatEntityByUniversalIdentifierByOperation<
  P extends AllMetadataName,
> = {
  flatEntityToCreate: Map<string, MetadataUniversalFlatEntity<P>>;
  flatEntityToUpdate: Map<string, MetadataUniversalFlatEntity<P>>;
  flatEntityToDelete: Map<string, MetadataUniversalFlatEntity<P>>;
};

export type AllFlatEntityOperationIndexByMetadataName = {
  [P in AllMetadataName]?: FlatEntityByUniversalIdentifierByOperation<P>;
};
