import { type FLAT_FIELD_METADATA_SHORT_CODE_BY_KEY } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type ShortCodeByKey = typeof FLAT_FIELD_METADATA_SHORT_CODE_BY_KEY;

export type EncodedFlatFieldMetadata = {
  [Key in keyof FlatFieldMetadata as Key extends keyof ShortCodeByKey
    ? ShortCodeByKey[Key]
    : Key]?: FlatFieldMetadata[Key];
};

export type EncodedFlatFieldMetadataMaps = {
  byUniversalIdentifier: Record<string, EncodedFlatFieldMetadata>;
  universalIdentifierById: FlatEntityMaps<FlatFieldMetadata>['universalIdentifierById'];
  universalIdentifiersByApplicationId: FlatEntityMaps<FlatFieldMetadata>['universalIdentifiersByApplicationId'];
};

export type EncodableFlatFieldMetadataMaps = {
  byUniversalIdentifier: Partial<Record<string, Partial<FlatFieldMetadata>>>;
  universalIdentifierById: FlatEntityMaps<FlatFieldMetadata>['universalIdentifierById'];
  universalIdentifiersByApplicationId: FlatEntityMaps<FlatFieldMetadata>['universalIdentifiersByApplicationId'];
};
