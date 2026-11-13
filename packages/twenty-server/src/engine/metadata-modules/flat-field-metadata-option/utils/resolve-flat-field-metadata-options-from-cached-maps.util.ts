import { isDefined } from 'twenty-shared/utils';

import {
  type FlatFieldMetadataForOptions,
  type FlatFieldMetadataOptionMapsForOptions,
  resolveFlatFieldMetadataOptions,
} from 'src/engine/metadata-modules/flat-field-metadata-option/utils/resolve-flat-field-metadata-options.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const RESOLVED_OPTIONS_BY_FIELD_BY_OPTION_MAPS = new WeakMap<
  FlatFieldMetadataOptionMapsForOptions,
  WeakMap<FlatFieldMetadataForOptions, FlatFieldMetadata['options']>
>();

// Memoized by object identity, so only for never-mutated workspace cache maps, not a migration build's.
export const resolveFlatFieldMetadataOptionsFromCachedMaps = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: FlatFieldMetadataForOptions;
  flatFieldMetadataOptionMaps: FlatFieldMetadataOptionMapsForOptions;
}): FlatFieldMetadata['options'] => {
  let resolvedOptionsByField = RESOLVED_OPTIONS_BY_FIELD_BY_OPTION_MAPS.get(
    flatFieldMetadataOptionMaps,
  );

  if (!isDefined(resolvedOptionsByField)) {
    resolvedOptionsByField = new WeakMap();
    RESOLVED_OPTIONS_BY_FIELD_BY_OPTION_MAPS.set(
      flatFieldMetadataOptionMaps,
      resolvedOptionsByField,
    );
  }

  if (resolvedOptionsByField.has(flatFieldMetadata)) {
    return resolvedOptionsByField.get(flatFieldMetadata) ?? null;
  }

  const resolvedOptions = resolveFlatFieldMetadataOptions({
    flatFieldMetadata,
    flatFieldMetadataOptionMaps,
  });

  resolvedOptionsByField.set(flatFieldMetadata, resolvedOptions);

  return resolvedOptions;
};
