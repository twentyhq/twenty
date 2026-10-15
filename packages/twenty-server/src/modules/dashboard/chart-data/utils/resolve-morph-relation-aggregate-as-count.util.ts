import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const resolveMorphRelationAggregateAsCount = <
  TConfiguration extends {
    aggregateFieldMetadataId: string;
    aggregateOperation: AggregateOperations;
  },
>({
  configuration,
  flatFieldMetadataMaps,
}: {
  configuration: TConfiguration;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TConfiguration => {
  const aggregateField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: configuration.aggregateFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  return aggregateField?.type === FieldMetadataType.MORPH_RELATION
    ? { ...configuration, aggregateOperation: AggregateOperations.COUNT }
    : configuration;
};
