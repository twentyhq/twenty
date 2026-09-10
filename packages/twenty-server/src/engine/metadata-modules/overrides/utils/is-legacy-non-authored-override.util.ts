import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-override-entry-property-names-by-metadata-name.constant';

export const isLegacyNonAuthoredOverride = ({
  metadataName,
  overrides,
}: {
  metadataName: AllMetadataName;
  overrides: Record<string, unknown>;
}): boolean =>
  Object.keys(overrides).some((key) =>
    ALL_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME[metadataName].has(key),
  );
