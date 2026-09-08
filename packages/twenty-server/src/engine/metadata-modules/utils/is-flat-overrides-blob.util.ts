import { ALL_OVERRIDE_ENTRY_PROPERTY_NAMES } from 'src/engine/metadata-modules/flat-entity/constant/all-override-entry-property-names.constant';

export const isFlatOverridesBlob = (
  overrides: Record<string, unknown>,
): boolean =>
  Object.keys(overrides).some((key) =>
    ALL_OVERRIDE_ENTRY_PROPERTY_NAMES.has(key),
  );
