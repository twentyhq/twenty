import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_FIELD_METADATA_EDITABLE_PROPERTIES = {
  custom: [
    'defaultValue',
    'description',
    'icon',
    'isActive',
    'isLabelSyncedWithName',
    'isUnique',
    'label',
    'name',
    'options',
    'settings',
  ],
  standard: [
    'defaultValue',
    'description',
    'icon',
    'isActive',
    'label',
    'options',
    'settings',
    'isUnique',
  ],
} as const satisfies Record<
  'standard' | 'custom',
  MetadataEntityPropertyName<'fieldMetadata'>[]
>;

// System-side-effect fields (default relations to standard objects provisioned
// by the metadata side-effect engine, partial system fields such as deletedAt /
// searchVector) are engine-owned: every structural property is derived and
// maintained by the engine. Users may only toggle activation.
export const FLAT_FIELD_METADATA_SYSTEM_SIDE_EFFECT_EDITABLE_PROPERTIES = [
  'isActive',
] as const satisfies MetadataEntityPropertyName<'fieldMetadata'>[];
