import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridablePropertyConfiguration = {
  isOverridable?: boolean;
  universalProperty?: string;
};

// Every key an override entry can carry, in flat and universal form. A blob
// whose keys include one of these is a flat entry rather than an author map:
// author keys are application universal identifiers, which never collide with
// a property name.
export const ALL_OVERRIDE_ENTRY_PROPERTY_NAMES: ReadonlySet<string> = new Set([
  'translations',
  ...Object.values(
    ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  ).flatMap((configuration) =>
    Object.entries(
      configuration as Record<string, OverridablePropertyConfiguration>,
    ).flatMap(([property, { isOverridable, universalProperty }]) =>
      isOverridable === true
        ? [property, ...(universalProperty ? [universalProperty] : [])]
        : [],
    ),
  ),
]);
