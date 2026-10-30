import { isDefined } from 'twenty-shared/utils';

import {
  FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS,
  FLAT_FIELD_METADATA_KEY_LOOKUP,
} from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-cache-codec.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  type CompactFlatFieldMetadata,
  type CompactFlatFieldMetadataMaps,
} from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const expandFlatFieldMetadataOrThrow = (
  compacted: CompactFlatFieldMetadata | Partial<FlatFieldMetadata>,
): FlatFieldMetadata => {
  const expanded: Partial<
    Record<string, FlatFieldMetadata[keyof FlatFieldMetadata]>
  > = {};

  for (const [shortCode, value] of Object.entries(compacted)) {
    expanded[FLAT_FIELD_METADATA_KEY_LOOKUP.get(shortCode) ?? shortCode] =
      value;
  }

  for (const key of FLAT_FIELD_METADATA_EMPTY_ARRAY_KEYS) {
    if (!(key in expanded)) {
      expanded[key] = [];
    }
  }

  if (!isDefined(expanded.isSearchable)) {
    throw new FlatEntityMapsException(
      'Cached flat field metadata is missing isSearchable',
      FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
    );
  }

  return expanded as FlatFieldMetadata;
};

export const expandFlatFieldMetadataMapsOrThrow = (
  compacted: CompactFlatFieldMetadataMaps,
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: FlatEntityMaps<FlatFieldMetadata>['byUniversalIdentifier'] =
    {};

  for (const [universalIdentifier, compactFlatFieldMetadata] of Object.entries(
    compacted.byUniversalIdentifier,
  )) {
    byUniversalIdentifier[universalIdentifier] = expandFlatFieldMetadataOrThrow(
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
