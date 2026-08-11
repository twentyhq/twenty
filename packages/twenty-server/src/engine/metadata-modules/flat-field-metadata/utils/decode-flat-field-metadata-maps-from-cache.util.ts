import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS,
  FLAT_FIELD_METADATA_KEY_LOOKUP,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  type EncodableFlatFieldMetadataMaps,
  type EncodedFlatFieldMetadata,
  type EncodedFlatFieldMetadataMaps,
} from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const decodeFlatFieldMetadata = (
  encoded: EncodedFlatFieldMetadata | Partial<FlatFieldMetadata>,
): FlatFieldMetadata => {
  const decoded: Partial<
    Record<string, FlatFieldMetadata[keyof FlatFieldMetadata]>
  > = {};

  for (const [shortCode, value] of Object.entries(encoded)) {
    decoded[FLAT_FIELD_METADATA_KEY_LOOKUP.get(shortCode) ?? shortCode] = value;
  }

  for (const key of FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS) {
    if (!(key in decoded)) {
      decoded[key] = [];
    }
  }

  return decoded as FlatFieldMetadata;
};

export const decodeFlatFieldMetadataMapsFromCache = (
  encoded: EncodedFlatFieldMetadataMaps | EncodableFlatFieldMetadataMaps,
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: FlatEntityMaps<FlatFieldMetadata>['byUniversalIdentifier'] =
    {};

  for (const [universalIdentifier, encodedFlatFieldMetadata] of Object.entries(
    encoded.byUniversalIdentifier,
  )) {
    byUniversalIdentifier[universalIdentifier] = decodeFlatFieldMetadata(
      encodedFlatFieldMetadata,
    );
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: encoded.universalIdentifierById,
    universalIdentifiersByApplicationId:
      encoded.universalIdentifiersByApplicationId,
  };
};
