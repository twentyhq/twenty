import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS,
  FLAT_FIELD_METADATA_KEY_LOOKUP,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  type CompactFlatFieldMetadata,
  type CompactFlatFieldMetadataMaps,
} from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const expandFlatFieldMetadata = (
  compacted: CompactFlatFieldMetadata | Partial<FlatFieldMetadata>,
): FlatFieldMetadata => {
  const expanded: Partial<
    Record<string, FlatFieldMetadata[keyof FlatFieldMetadata]>
  > = {};

  for (const [shortCode, value] of Object.entries(compacted)) {
    expanded[FLAT_FIELD_METADATA_KEY_LOOKUP.get(shortCode) ?? shortCode] = value;
  }

  for (const key of FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS) {
    if (!(key in expanded)) {
      expanded[key] = [];
    }
  }

  return expanded as FlatFieldMetadata;
};

export const expandFlatFieldMetadataMaps = (
  compacted: CompactFlatFieldMetadataMaps,
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: FlatEntityMaps<FlatFieldMetadata>['byUniversalIdentifier'] =
    {};

  for (const [
    universalIdentifier,
    compactFlatFieldMetadata,
  ] of Object.entries(compacted.byUniversalIdentifier)) {
    byUniversalIdentifier[universalIdentifier] = expandFlatFieldMetadata(
      compactFlatFieldMetadata,
    );
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById: compacted.universalIdentifierById,
    universalIdentifiersByApplicationId:
      compacted.universalIdentifiersByApplicationId,
  };
};
