import { type AllMetadataName } from 'twenty-shared/metadata';

import {
  type ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  type MetadataEntityOverridablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type ToUniversalForeignKey } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/to-universal-foreign-key.type';

// Read from the registry literal rather than from the many-to-one relation
// registry: that one validates itself against every entity property type, and
// an overridable entity types its overrides column from this.
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
