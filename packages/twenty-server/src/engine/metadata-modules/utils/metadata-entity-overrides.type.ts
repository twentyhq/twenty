import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { type SerializedRelation } from 'twenty-shared/types';

import {
  type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ToUniversalForeignKey } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/to-universal-foreign-key.type';

// Read from the registry literal rather than from the many-to-one relation
// registry: that one validates itself against every entity property type, and
// an overridable entity types its overrides column with the types below.
export type MetadataEntityOverridableForeignKeyName<T extends AllMetadataName> =
  {
    [P in MetadataEntityOverridablePropertyName<T>]: P extends keyof (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T]
      ? (typeof ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME)[T][P] extends {
          universalProperty: ToUniversalForeignKey<P & string>;
        }
        ? P
        : never
      : never;
  }[MetadataEntityOverridablePropertyName<T>];

// The entity is only ever read from the mapped type templates below, never
// from their key constraints: TypeScript resolves a mapped type's keys eagerly
// when it instantiates it, which would make the entity depend on itself.
type MetadataEntityTranslatableProperties<T extends AllMetadataName> = {
  [P in MetadataEntityTranslatablePropertyName<T>]?: P extends keyof MetadataEntity<T>
    ? MetadataEntity<T>[P]
    : never;
};

export type MetadataEntityOverridesTranslations<T extends AllMetadataName> =
  T extends TranslatableMetadataName
    ? {
        translations?: Partial<
          Record<
            keyof typeof APP_LOCALES,
            MetadataEntityTranslatableProperties<T>
          >
        > | null;
      }
    : unknown;

// A foreign key stored in the overrides blob has no FK constraint, which is what
// SerializedRelation encodes: it is also the brand
// FormatRecordSerializedRelationProperties keys on to expose the property as a
// universal identifier on the universal flat entity.
type MetadataEntityOverridableProperties<T extends AllMetadataName> = {
  [P in MetadataEntityOverridablePropertyName<T>]?: P extends keyof MetadataEntity<T>
    ? P extends MetadataEntityOverridableForeignKeyName<T>
      ? SerializedRelation | Extract<MetadataEntity<T>[P], null>
      : MetadataEntity<T>[P]
    : never;
};

// Nullability is inherited from the column: a non-nullable column cannot be
// overridden with null.
export type MetadataEntityOverrides<T extends AllMetadataName> =
  MetadataEntityOverridableProperties<T> &
    MetadataEntityOverridesTranslations<T>;
