import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

export type FromEntityToFlatEntityArgs<T extends AllMetadataName> = {
  entity: EntityWithRegroupedOneToManyRelations<MetadataEntity<T>>;
} & EntityManyToOneIdByUniversalIdentifierMaps<T>;
