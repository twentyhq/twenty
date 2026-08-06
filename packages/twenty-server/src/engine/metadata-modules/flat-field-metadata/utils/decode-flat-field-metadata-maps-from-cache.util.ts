import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS,
  FLAT_FIELD_METADATA_KEY_BY_SHORT_CODE,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type EncodedFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const decodeFlatFieldMetadata = (
  encoded: Record<string, unknown>,
): FlatFieldMetadata => {
  const decoded: Record<string, unknown> = {};

  for (const key of FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS) {
    decoded[key] = [];
  }

  for (const [shortCode, value] of Object.entries(encoded)) {
    decoded[FLAT_FIELD_METADATA_KEY_BY_SHORT_CODE.get(shortCode) ?? shortCode] =
      value;
  }

  return decoded as FlatFieldMetadata;
};

export const decodeFlatFieldMetadataMapsFromCache = (
  encoded: EncodedFlatFieldMetadataMaps,
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
