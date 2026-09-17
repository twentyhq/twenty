import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridablePropertyConfiguration = {
  isOverridable?: boolean;
  universalProperty?: string;
};

export const ALL_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME: Record<
  AllMetadataName,
  ReadonlySet<string>
> = Object.fromEntries(
  Object.values(ALL_METADATA_NAME).map((metadataName) => [
    metadataName,
    new Set([
      'translations',
      ...Object.entries(
        ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[
          metadataName
        ] as Record<string, OverridablePropertyConfiguration>,
      ).flatMap(([property, { isOverridable, universalProperty }]) =>
        isOverridable === true
          ? [property, ...(universalProperty ? [universalProperty] : [])]
          : [],
      ),
    ]),
  ]),
) as unknown as Record<AllMetadataName, ReadonlySet<string>>;
