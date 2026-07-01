import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

export type MetadataSideEffectOperationsByMetadataName = {
  [P in AllMetadataName]?: {
    flatEntityToCreate?: (MetadataUniversalFlatEntity<P> & { id?: string })[];
    flatEntityToUpdate?: MetadataUniversalFlatEntity<P>[];
    flatEntityToDelete?: MetadataUniversalFlatEntity<P>[];
  };
};
