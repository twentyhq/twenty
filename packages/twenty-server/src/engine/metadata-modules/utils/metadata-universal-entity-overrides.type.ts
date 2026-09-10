import { type AllMetadataName } from 'twenty-shared/metadata';
import { type SerializedRelation } from 'twenty-shared/types';

import {
  type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityOverridablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntityOverridableForeignKeyName } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity-overridable-foreign-key-name.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type MetadataEntityOverridesTranslations } from 'src/engine/metadata-modules/utils/metadata-entity-overrides-translations.type';

type MetadataEntityUniversalPropertyName<
  T extends AllMetadataName,
  P extends PropertyKey,
> = P extends keyof (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
  ? (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T][P] extends {
      universalProperty: infer TUniversalProperty extends string;
    }
    ? TUniversalProperty
    : P
  : P;

// A universal identifier in the overrides blob resolves through no FK
// constraint, so it may point at nothing: it is nullable whatever the column's
// nullability, exactly as FormatRecordSerializedRelationProperties types it on
// the universal flat entity.
type MetadataUniversalEntityOverridableProperties<T extends AllMetadataName> = {
  [P in MetadataEntityOverridablePropertyName<T> as MetadataEntityUniversalPropertyName<
    T,
    P
  >]?: P extends MetadataEntityOverridableForeignKeyName<T>
    ? SerializedRelation | null
    : MetadataEntityUniversalPropertyName<
          T,
          P
        > extends keyof MetadataUniversalFlatEntity<T>
      ? MetadataUniversalFlatEntity<T>[MetadataEntityUniversalPropertyName<
          T,
          P
        >]
      : never;
};

export type MetadataUniversalEntityOverrides<T extends AllMetadataName> =
  MetadataUniversalEntityOverridableProperties<T> &
    MetadataEntityOverridesTranslations<T>;
