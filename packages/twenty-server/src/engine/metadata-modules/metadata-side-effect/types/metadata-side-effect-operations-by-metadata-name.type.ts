import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';

// What a side-effect handler returns: a partial create/update/delete matrix of the
// companion entities it wants the migration to apply. Each operation bucket is optional
// so a handler only fills the operations it cares about (e.g. a create handler returns
// `flatEntityToCreate` companions, a delete handler returns `flatEntityToDelete` ones).
// The engine merges these into the operation matrix being expanded with add-if-absent
// semantics per (operation, metadataName, universalIdentifier), then re-feeds each newly
// added companion to the handler registered for that same (operation, metadataName) so
// cascades (create object -> create fields, delete object -> delete fields...) resolve to
// a fixpoint. Handlers stay responsible for natural-key deduplication of what they return.
export type MetadataSideEffectOperationsByMetadataName = {
  [P in AllMetadataName]?: {
    flatEntityToCreate?: (MetadataUniversalFlatEntity<P> & { id?: string })[];
    flatEntityToUpdate?: MetadataUniversalFlatEntity<P>[];
    flatEntityToDelete?: MetadataUniversalFlatEntity<P>[];
  };
};
