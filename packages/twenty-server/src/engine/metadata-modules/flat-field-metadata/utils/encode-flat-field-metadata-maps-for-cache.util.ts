import { isDefined } from 'twenty-shared/utils';

import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEY_SET,
  FLAT_FIELD_METADATA_SHORT_CODE_LOOKUP,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  type EncodedFlatFieldMetadata,
  type EncodedFlatFieldMetadataMaps,
} from 'src/engine/metadata-modules/flat-field-metadata/types/encoded-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const encodeFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata,
): EncodedFlatFieldMetadata => {
  const encoded: Partial<
    Record<string, FlatFieldMetadata[keyof FlatFieldMetadata]>
  > = {};

  for (const [key, value] of Object.entries(flatFieldMetadata)) {
    if (
      FLAT_FIELD_METADATA_EMPTY_ARRAY_KEY_SET.has(key) &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      continue;
    }

    encoded[FLAT_FIELD_METADATA_SHORT_CODE_LOOKUP.get(key) ?? key] = value;
  }

  return encoded;
};

export const encodeFlatFieldMetadataMapsForCache = (
  flatEntityMaps: FlatEntityMaps<FlatFieldMetadata>,
): EncodedFlatFieldMetadataMaps => {
  const byUniversalIdentifier: Record<string, EncodedFlatFieldMetadata> = {};

  for (const [universalIdentifier, flatFieldMetadata] of Object.entries(
    flatEntityMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    byUniversalIdentifier[universalIdentifier] =
      encodeFlatFieldMetadata(flatFieldMetadata);
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: flatEntityMaps.universalIdentifierById,
    universalIdentifiersByApplicationId:
      flatEntityMaps.universalIdentifiersByApplicationId,
  };
};
