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

// For per-record callers. Only safe with maps and fields read from the workspace cache, which are
// never mutated; a migration build's optimistic maps must use resolveFlatFieldMetadataOptions.
export const resolveFlatFieldMetadataOptionsFromCachedMaps = ({
  flatFieldMetadata,
  flatFieldMetadataOptionMaps,
}: {
  flatFieldMetadata: FlatFieldMetadataForOptions;
  flatFieldMetadataOptionMaps:
    | FlatFieldMetadataOptionMapsForOptions
    | undefined;
}): FlatFieldMetadata['options'] => {
  if (!isDefined(flatFieldMetadataOptionMaps)) {
    return flatFieldMetadata.options;
  }

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
