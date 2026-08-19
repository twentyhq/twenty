import { isDefined } from 'twenty-shared/utils';

import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEY_SET,
  FLAT_FIELD_METADATA_SHORT_CODE_LOOKUP,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import {
  type CompactFlatFieldMetadata,
  type CompactFlatFieldMetadataMaps,
  type ExpandedFlatFieldMetadataMaps,
} from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const compactFlatFieldMetadata = (
  flatFieldMetadata: Partial<FlatFieldMetadata>,
): CompactFlatFieldMetadata => {
  const compacted: Partial<
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

    compacted[FLAT_FIELD_METADATA_SHORT_CODE_LOOKUP.get(key) ?? key] = value;
  }

  return compacted;
};

export const compactFlatFieldMetadataMaps = (
  flatEntityMaps: ExpandedFlatFieldMetadataMaps,
): CompactFlatFieldMetadataMaps => {
  const byUniversalIdentifier: Record<string, CompactFlatFieldMetadata> = {};

  for (const [universalIdentifier, flatFieldMetadata] of Object.entries(
    flatEntityMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    byUniversalIdentifier[universalIdentifier] =
      compactFlatFieldMetadata(flatFieldMetadata);
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: flatEntityMaps.universalIdentifierById,
    universalIdentifiersByApplicationId:
      flatEntityMaps.universalIdentifiersByApplicationId,
  };
};
