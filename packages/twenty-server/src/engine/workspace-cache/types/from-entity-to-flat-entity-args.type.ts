import { MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { EntityManyToOneIdByUniversalIdentifierMaps } from 'src/engine/workspace-cache/types/entity-many-to-one-id-by-universal-identifier-maps.type';
import { EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';
import { AllMetadataName } from 'twenty-shared/metadata';

export type FromEntityToFlatEntityArgs<T extends AllMetadataName> = {
  entity: EntityWithRegroupedOneToManyRelations<MetadataEntity<T>>;
} & EntityManyToOneIdByUniversalIdentifierMaps<T>;
