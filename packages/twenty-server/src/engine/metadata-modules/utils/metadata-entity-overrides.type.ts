import { type AllMetadataName } from 'twenty-shared/metadata';
import { type SerializedRelation } from 'twenty-shared/types';

import { type MetadataEntityOverridablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataEntityOverridableForeignKeyName } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity-overridable-foreign-key-name.type';
import { type MetadataEntityOverridesTranslations } from 'src/engine/metadata-modules/utils/metadata-entity-overrides-translations.type';

// The entity is only ever read from the mapped type template, never from its
// key constraint: TypeScript resolves a mapped type's keys eagerly when it
// instantiates it, which would make the entity depend on itself.
//
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
