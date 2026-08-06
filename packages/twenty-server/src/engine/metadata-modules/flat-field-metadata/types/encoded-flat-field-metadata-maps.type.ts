import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export type EncodedFlatFieldMetadataMaps = {
  byUniversalIdentifier: Record<string, Record<string, unknown>>;
  universalIdentifierById: FlatEntityMaps<FlatFieldMetadata>['universalIdentifierById'];
  universalIdentifiersByApplicationId: FlatEntityMaps<FlatFieldMetadata>['universalIdentifiersByApplicationId'];
};
